/* eslint-disable @typescript-eslint/no-floating-promises */

import { type NESCpuComponent } from '../../../src/core/cpu/types'
import { type NESMemoryComponent } from '../../../src/core/memory/types'
import { DebugEvents } from '../../../src/nes/components/debugger/consts/events'
import { type NESDebuggerComponent } from '../../../src/nes/components/debugger/types'
import { NES } from '../../../src/nes/nes'
import { type NESModule } from '../../../src/nes/types'
import { storePRG } from '../helpers/memory-helper'

describe('Tests for NES ROMs executions.', () => {
  let nes: NESModule
  let cpu: NESCpuComponent
  let memory: NESMemoryComponent
  let nesDebugger: NESDebuggerComponent

  beforeEach(() => {
    nes = NES.create()
    nesDebugger = nes.debug()

    cpu = nes.getComponents().cpu
    memory = nes.getComponents().memory
  })

  test('should execute the PRG code after power-up', (done) => {
    /**
      0x8000  78      sei
      0x8001  d8      cld
      0x8002  a20f    ldx #$0f
      0x8004  9a      txs
      0x8005  ad0220  lda $2002   (sym.PPU_STATUS)
      0x8008  30fb    bmi $8005
      0x800a  a900    lda #$00
      0x700c  ea      nop
     */
    const prg = new Uint8Array([
      0x78, 0xd8, 0xa2, 0x0f, 0x9a, 0xad, 0x02, 0x20, 0x30, 0xfb, 0xa9, 0x00,
      0xea
    ])
    storePRG(memory, prg)

    nesDebugger.addBreakpoint(0x800c)
    nesDebugger.run()

    nesDebugger.on('pause', ({ type, data }) => {
      const { paused } = data.cpuState
      const { opcode, asm } = data.cpuState.lastExecuted

      expect(type).toBe(DebugEvents.Pause)
      expect(asm).toBe('lda #$00')
      expect(opcode).toBe(0xa9)
      expect(cpu.getPC()).toBe(0x800c)
      expect(paused).toBe(true)

      done()
    })
  })

  test('should execute the PRG code with branching after power-up', (done) => {
    /**
      0x8000  78      sei
      0x8001  d8      cld
      0x8002  a2ff    ldx #$ff    (Cause branching, NegativeFlag set)
      0x8004  9a      txs
      0x8005  ad0220  lda $2002   (sym.PPU_STATUS)
      0x8008  10fb    bpl $8005   (Branch because negative flag is always zero from $2002)
      0x800a  a900    lda #$00
      0x700c  ea      nop
     */
    const prg = new Uint8Array([
      0x78, 0xd8, 0xa2, 0xff, 0x9a, 0xad, 0x02, 0x20, 0x10, 0xfb, 0xa9, 0x00,
      0xea
    ])
    storePRG(memory, prg)

    nesDebugger.breakOn({ insExecuted: 21 })
    nesDebugger.run()

    nesDebugger.on('pause', ({ type, data }) => {
      const { paused } = data.cpuState
      const { opcode, asm } = data.cpuState.lastExecuted

      expect(type).toBe(DebugEvents.Pause)
      expect(asm).toBe('lda $2002')
      expect(opcode).toBe(0xad)
      expect(cpu.getPC()).toBe(0x8008)
      expect(paused).toBe(true)

      done()
    })
  })

  test('should stop execution before the first instruction is executed', (done) => {
    const filePath =
      './tests/integration/__nes_roms__/instr_test-v5/rom_singles/01-basics.nes'
    const romResetVector = 0xe683

    nesDebugger.breakOn({ atResetVector: true })
    nes.loadROM({ filePath })

    nesDebugger.on('pause', ({ type, data }) => {
      const { paused } = data.cpuState

      expect(type).toBe(DebugEvents.Pause)
      expect(cpu.getPC()).toBe(romResetVector)
      expect(paused).toBe(true)

      done()
    })
  })

  test('should stop execution when ROM test status was running (0x80)', (done) => {
    const filePath =
      './tests/integration/__nes_roms__/instr_test-v5/rom_singles/01-basics.nes'
    const testStatusAddress = 0x6000

    nesDebugger.addMemoryBreakpoint({
      address: testStatusAddress,
      equalsTo: 0x80,
      onWrite: true
    })
    nes.loadROM({ filePath })

    nesDebugger.on('pause', ({ type, data }) => {
      const { paused } = data.cpuState
      const memoryValue = memory.load(testStatusAddress)

      expect(type).toBe(DebugEvents.Pause)
      expect(paused).toBe(true)
      expect(memoryValue).toBe(0x80)
      expect(cpu.getPC()).toBeLessThanOrEqual(0xffff)
      expect(cpu.getPC()).toBeGreaterThanOrEqual(0x8000)

      done()
    })
  })

  test('should stop execution when ROM test $6001 memory value is between (0x80-0xff) status', (done) => {
    const filePath =
      './tests/integration/__nes_roms__/instr_test-v5/rom_singles/01-basics.nes'
    const testStatusAddress = 0x6001

    nesDebugger.addMemoryBreakpoint({
      address: testStatusAddress,
      greaterThanOrEquals: 0x80,
      lessThanOrEquals: 0xff,
      onWrite: true
    })
    nes.loadROM({ filePath })

    nesDebugger.on('pause', ({ type, data }) => {
      const { paused } = data.cpuState
      const memoryValue = memory.load(testStatusAddress)

      expect(type).toBe(DebugEvents.Pause)
      expect(paused).toBe(true)
      expect(memoryValue).toBe(0xde)
      expect(cpu.getPC()).toBeGreaterThanOrEqual(0x8000)
      expect(cpu.getPC()).toBeLessThanOrEqual(0xffff)

      done()
    })
  })
})
