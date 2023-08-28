import CPU_FLAGS from '../cpu-consts/cpu-flags'
import CPU_REGISTERS from '../cpu-consts/cpu-registers'
import CPU_ADDRESSING_MODES from '../cpu-consts/cpu-addressing-modes'

export default (cpu, cpuALU) => {
  const addressingModes = {
    0xe9: CPU_ADDRESSING_MODES.Immediate,
    0xe5: CPU_ADDRESSING_MODES.ZeroPage,
    0xf5: CPU_ADDRESSING_MODES.ZeroPageX,
    0xed: CPU_ADDRESSING_MODES.Absolute,
    0xfd: CPU_ADDRESSING_MODES.AbsoluteX,
    0xf9: CPU_ADDRESSING_MODES.AbsoluteY,
    0xe1: CPU_ADDRESSING_MODES.IndexedIndirect,
    0xf1: CPU_ADDRESSING_MODES.IndirectIndexed
  }

  const execute = (opcode, operand) => {
    const addressingMode = addressingModes[opcode]
    const carryFlag = cpuALU.getFlag(CPU_FLAGS.CarryFlag)
    const memoryValue = cpu.getMemoryValueFromAddressingMode(addressingMode, operand)
    const currentAccumulator = cpu.REG.A
    const twoComplement = cpuALU.getTwoComplement(memoryValue)

    const result = cpu.REG.A + twoComplement + carryFlag
    cpu.setRegister(CPU_REGISTERS.A, result & 0xff)

    updateStatus(result, memoryValue, currentAccumulator)
  }

  const updateStatus = (result, memoryValue, previousAccumulator) => {
    const carryFlag = cpuALU.getSignedByte(result) >= 0x00 ? 1 : 0

    cpuALU.setFlag(CPU_FLAGS.CarryFlag, carryFlag)
    cpuALU.updateZeroFlag(result)
    cpuALU.updateNegativeFlag(result)
    cpuALU.updateOverflowFlag(result, memoryValue, previousAccumulator)
  }

  return {
    execute
  }
}
