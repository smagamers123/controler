import { CPU } from '../../src/core/cpu/cpu'
import { CPU_ADDRESSING_MODES } from '../../src/core/cpu/consts/addressing-modes'
import { CPU_REGISTERS } from '../../src/core/cpu/consts/registers'
import { CPU_MEMORY_MAP } from '../../src/core/memory/consts/memory-map'

describe('Test for CPU Addressing Modes', () => {
  let cpu

  beforeEach(() => {
    cpu = new CPU()
  })

  test('should get data from Acumulator addressing mode.', () => {
    const acumulatorValue = 0xab
    cpu.setRegister(CPU_REGISTERS.A, acumulatorValue)

    const value = cpu.memory.loadByAddressingMode(CPU_ADDRESSING_MODES.Acumulator)

    expect(value).toBe(acumulatorValue)
  })

  test('should get data from Immediate addressing mode.', () => {
    const immediateValue = 0xab
    const value = cpu.memory.loadByAddressingMode(CPU_ADDRESSING_MODES.Immediate, immediateValue)

    expect(value).toBe(immediateValue)
  })

  test('should get data from Zero Page addressing mode.', () => {
    const memoryValue = 0x78
    const zeroPageOffset = 0x10
    const memoryAddress = CPU_MEMORY_MAP.ZeroPage + zeroPageOffset
    cpu.memory.store(memoryAddress, memoryValue)

    const value = cpu.memory.loadByAddressingMode(CPU_ADDRESSING_MODES.ZeroPage, zeroPageOffset)

    expect(value).toBe(memoryValue)
  })

  test('should get data from Zero Page, X addressing mode.', () => {
    const memoryValue = 0xbe
    const registerXValue = 0xff
    const zeroPageOffset = 0x80
    const memoryAddress = CPU_MEMORY_MAP.ZeroPage + ((zeroPageOffset + registerXValue) & 0xff)

    cpu.setRegister(CPU_REGISTERS.X, registerXValue)
    cpu.memory.store(memoryAddress, memoryValue)

    const value = cpu.memory.loadByAddressingMode(CPU_ADDRESSING_MODES.ZeroPageX, zeroPageOffset)

    expect(value).toBe(memoryValue)
  })

  test('should get data from Zero Page, Y addressing mode.', () => {
    const memoryValue = 0xd7
    const registerYValue = 0xff
    const zeroPageOffset = 0x86
    const memoryAddress = CPU_MEMORY_MAP.ZeroPage + ((zeroPageOffset + registerYValue) & 0xff)

    cpu.setRegister(CPU_REGISTERS.Y, registerYValue)
    cpu.memory.store(memoryAddress, memoryValue)

    const value = cpu.memory.loadByAddressingMode(CPU_ADDRESSING_MODES.ZeroPageY, zeroPageOffset)

    expect(value).toBe(memoryValue)
  })

  test('should get data from Relative addressing mode with negative operand.', () => {
    const signedValue = 0xff

    const value = cpu.memory.loadByAddressingMode(CPU_ADDRESSING_MODES.Relative, signedValue)
    expect(value).toBe(-1)
  })

  test('should get data from Relative addressing mode with positive operand.', () => {
    const signedValue = 0x7f

    const value = cpu.memory.loadByAddressingMode(CPU_ADDRESSING_MODES.Relative, signedValue)
    expect(value).toBe(127)
  })

  test('should get data from Absolute addressing mode.', () => {
    const memoryAddress = 0xabcd
    cpu.memory.store(memoryAddress, 0x56)

    const value = cpu.memory.loadByAddressingMode(CPU_ADDRESSING_MODES.Absolute, memoryAddress)
    expect(value).toBe(0x56)
  })

  test('should get data from Absolute, X addressing mode.', () => {
    const memoryAddress = 0xff10
    cpu.setRegister(CPU_REGISTERS.X, 0xff)

    cpu.memory.store(memoryAddress + cpu.getRegister(CPU_REGISTERS.X), 0x56)
    const value = cpu.memory.loadByAddressingMode(CPU_ADDRESSING_MODES.AbsoluteX, memoryAddress)

    expect(value).toBe(0x56)
  })

  test('should get data from Absolute, Y addressing mode.', () => {
    const memoryAddress = 0xff20
    cpu.setRegister(CPU_REGISTERS.Y, 0xff)

    cpu.memory.store(memoryAddress + cpu.getRegister(CPU_REGISTERS.Y), 0x56)
    const value = cpu.memory.loadByAddressingMode(CPU_ADDRESSING_MODES.AbsoluteY, memoryAddress)
    expect(value).toBe(0x56)
  })

  test('should get data from Indirect addressing mode.', () => {
    const memoryAddress = 0xabcde
    cpu.memory.storeWord(memoryAddress, 0x1234)

    const LSB = cpu.memory.load(memoryAddress)
    const MSB = cpu.memory.load(memoryAddress + 1)
    const addressValue = cpu.memory.loadByAddressingMode(CPU_ADDRESSING_MODES.Indirect, memoryAddress)

    expect(LSB).toBe(0x34)
    expect(MSB).toBe(0x12)
    expect(addressValue).toBe(0x1234)
  })

  test('should get data from Indexed Indirect (d, x) addressing mode.', () => {
    const memoryAddress = 0x80a2
    const xRegistervalue = 0x10
    const zeroPageOffset = 0x10

    cpu.setRegister(CPU_REGISTERS.X, xRegistervalue)
    cpu.memory.store(memoryAddress, 0xab)
    cpu.memory.storeWord(zeroPageOffset + xRegistervalue, memoryAddress)

    const LSB = cpu.memory.load(zeroPageOffset + xRegistervalue)
    const MSB = cpu.memory.load(zeroPageOffset + xRegistervalue + 1)
    const memoryValue = cpu.memory.loadByAddressingMode(CPU_ADDRESSING_MODES.IndexedIndirect, zeroPageOffset)

    expect(LSB).toBe(0xa2)
    expect(MSB).toBe(0x80)
    expect(memoryValue).toBe(0xab)
  })

  test('should get data from Indexed Indirect (d, x) addressing mode with Zero Page overflow.', () => {
    const memoryAddress = 0x8000
    const xRegistervalue = 0x00
    const zeroPageOffset = 0xff

    cpu.setRegister(CPU_REGISTERS.X, xRegistervalue)
    cpu.memory.store(memoryAddress, 0xcd)
    cpu.memory.store(zeroPageOffset, 0x00)
    cpu.memory.store((zeroPageOffset + 1) & 0xff, 0x80)

    const memoryValue = cpu.memory.loadByAddressingMode(CPU_ADDRESSING_MODES.IndexedIndirect, zeroPageOffset)
    expect(memoryValue).toBe(0xcd)
  })

  test('should get data from Indirect Indexed (d), y addressing mode.', () => {
    const yRegisterValue = 0x05
    const zeroPagevalue = 0x8000
    const zeroPageOffset = 0x10

    cpu.setRegister(CPU_REGISTERS.Y, yRegisterValue)
    cpu.memory.storeWord(zeroPageOffset, zeroPagevalue)
    cpu.memory.storeWord(zeroPagevalue + yRegisterValue, 0xab)

    const memoryValue = cpu.memory.loadByAddressingMode(CPU_ADDRESSING_MODES.IndirectIndexed, zeroPageOffset)
    expect(memoryValue).toBe(0xab)
  })

  test('should get data from Indirect Indexed (d), y addressing mode with Zero Page overflow.', () => {
    const yRegisterValue = 0x05
    const zeroPagevalue = 0x8000
    const zeroPageOffset = 0xff

    cpu.setRegister(CPU_REGISTERS.Y, yRegisterValue)
    cpu.memory.store(zeroPageOffset, 0x00)
    cpu.memory.store(0x00, 0x80)
    cpu.memory.store(zeroPagevalue + yRegisterValue, 0xab)

    const memoryValue = cpu.memory.loadByAddressingMode(CPU_ADDRESSING_MODES.IndirectIndexed, zeroPageOffset)
    expect(memoryValue).toBe(0xab)
  })
})
