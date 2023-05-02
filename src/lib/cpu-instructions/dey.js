import CPU_REGISTERS from '../cpu-consts/cpu-registers'

export default (cpu, cpuALU) => {
  const execute = (opcode) => {
    const registerValue = cpu.REG.Y
    const resultValue = (registerValue - 1) & 0xff

    cpu.setRegister(CPU_REGISTERS.Y, resultValue)
    updateStatus(resultValue)
  }

  const updateStatus = (result) => {
    cpuALU.updateZeroFlag(result)
    cpuALU.updateNegativeFlag(result)
  }

  return {
    execute
  }
}
