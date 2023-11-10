import { CPU_ADDRESSING_MODES } from '../consts/addressing-modes'
import { CPU_REGISTERS } from '../consts/registers'

export default (cpu, cpuALU) => {
  const addressingModes = {
    0x18: CPU_ADDRESSING_MODES.Implied
  }

  const execute = (opcode) => {
    const addressingMode = addressingModes[opcode]
    const currentXRegister = cpu.getRegister(CPU_REGISTERS.X)

    cpu.setRegister(CPU_REGISTERS.A, currentXRegister)
    updateStatus(cpu.getRegister(CPU_REGISTERS.A))
    cpu.nextPC(addressingMode)
  }

  const updateStatus = (newAccumulator) => {
    cpuALU.updateZeroFlag(newAccumulator)
    cpuALU.updateNegativeFlag(newAccumulator)
  }

  return {
    execute
  }
}
