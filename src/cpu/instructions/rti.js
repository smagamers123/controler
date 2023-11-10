import { CPU_REGISTERS } from '../consts/registers'

export default (cpu) => {
  const execute = (opcode, operand) => {
    const currentSP = cpu.getRegister(CPU_REGISTERS.SP)
    const stackMemoryAddress = 0x100 + currentSP
    const processorStatus = cpu.load(stackMemoryAddress)
    const pc = cpu.loadWord(stackMemoryAddress + 1)

    cpu.setRegister(CPU_REGISTERS.P, processorStatus)
    cpu.setRegister(CPU_REGISTERS.SP, currentSP + 2)
    cpu.setPC(pc)
  }

  return {
    execute
  }
}
