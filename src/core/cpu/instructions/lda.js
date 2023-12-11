import { getASMByAddrMode, CPU_ADDRESSING_MODES } from '../consts/addressing-modes'
import { CPU_REGISTERS } from '../consts/registers'

export class Lda {
  #cpu = null
  #cpuALU = null

  addressingModes = {
    0xa9: CPU_ADDRESSING_MODES.Immediate,
    0xa5: CPU_ADDRESSING_MODES.ZeroPage,
    0xb5: CPU_ADDRESSING_MODES.ZeroPageX,
    0xad: CPU_ADDRESSING_MODES.Absolute,
    0xbd: CPU_ADDRESSING_MODES.AbsoluteX,
    0xb9: CPU_ADDRESSING_MODES.AbsoluteY,
    0xa1: CPU_ADDRESSING_MODES.IndexedIndirect,
    0xb1: CPU_ADDRESSING_MODES.IndirectIndexed
  }

  constructor (cpu, cpuALU) {
    this.#cpu = cpu
    this.#cpuALU = cpuALU
  }

  execute (opcode, operand) {
    const addressingMode = this.addressingModes[opcode]
    const memoryValue = this.#cpu.memory.loadByAddressingMode(addressingMode, operand)

    this.#cpu.setRegister(CPU_REGISTERS.A, memoryValue)
    this.updateStatus(this.#cpu.getRegister(CPU_REGISTERS.A))
    this.#cpu.nextPC(addressingMode)
  }

  updateStatus (result) {
    this.#cpuALU.updateZeroFlag(result)
    this.#cpuALU.updateNegativeFlag(result)
  }

  getASM (instruction) {
    const [opcode, operand] = instruction
    const addressingMode = this.addressingModes[opcode]
    return `lda${getASMByAddrMode(addressingMode, operand)}`
  }
}
