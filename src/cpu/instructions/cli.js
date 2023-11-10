import { CPU_ADDRESSING_MODES } from '../consts/addressing-modes'
import { CPU_FLAGS } from '../consts/flags'

export default (cpu, cpuALU) => {
  const addressingModes = {
    0x58: CPU_ADDRESSING_MODES.Implied
  }

  const execute = (opcode) => {
    const addressingMode = addressingModes[opcode]

    cpuALU.clearFlag(CPU_FLAGS.InterruptDisable)
    cpu.nextPC(addressingMode)
  }

  return {
    execute
  }
}
