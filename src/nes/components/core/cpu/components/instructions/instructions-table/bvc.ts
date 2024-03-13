import { CPUAddressingModes } from 'src/nes/components/core/cpu/consts/addressing-modes'
import { CPUFlags } from 'src/nes/components/core/cpu/consts/flags'
import { type CPUAddrModeTable } from 'src/nes/components/core/cpu/types'
import { BaseInstruction } from '../base-instruction'

export class Bvc extends BaseInstruction {
  readonly name = 'bvc'
  readonly AddressingModes: CPUAddrModeTable = {
    0x50: CPUAddressingModes.Relative
  }

  execute (opcode: number, operand: number): void {
    const addressingMode = this.AddressingModes[opcode]
    const overflowFlag = this.alu.getFlag(CPUFlags.OverflowFlag)
    let displacement = 0x00

    if (overflowFlag === 0x00) {
      displacement = this.alu.getSignedByte(operand)
      this.addBranchExtraCycles(displacement)
    }

    this.cpu.nextPC(addressingMode, displacement)
  }
}
