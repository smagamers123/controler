import { CPUAddressingModes } from '../../../consts/addressing-modes'
import { CPUFlags } from '../../../consts/flags'
import { type CPUAddrModeTable } from '../../../types'
import { BaseInstruction } from '../base-instruction'

export class Bpl extends BaseInstruction {
  readonly name = 'bpl'
  readonly AddressingModes: CPUAddrModeTable = {
    0x10: CPUAddressingModes.Relative
  }

  execute (opcode: number, operand: number): void {
    const addressingMode = this.AddressingModes[opcode]
    const negativeFlag = this.alu.getFlag(CPUFlags.NegativeFlag)
    let displacement = 0x00

    if (negativeFlag === 0x00) {
      displacement = this.alu.getSignedByte(operand)
      this.addBranchExtraCycles(displacement)
    }

    this.cpu.nextPC(addressingMode, displacement)
  }
}
