import { InstructionsTable } from './instructions-table'
import {
  type CPUInstructionTable,
  type CPUInstruction,
  type NESInstructionComponent
} from '../../types'
import { CPUInstructionSize } from '../../consts/instructions'
import { InstructionsCPUCyclesTable } from './consts/instructions-cycles'
import type ControlBus from '../../../control-bus/control-bus'
import { type BaseInstruction } from './base-instruction'

export class Instruction implements NESInstructionComponent {
  private readonly InstructionsCyclesTable = InstructionsCPUCyclesTable
  private readonly instructionsTable: CPUInstructionTable

  private constructor (readonly control: ControlBus) {
    this.instructionsTable = InstructionsTable(control)
  }

  execute (instruction: CPUInstruction): void {
    this.decodeAndExecute(instruction)
  }

  getInstructionASM (instruction: CPUInstruction): string {
    const decoded = this.decode(instruction)
    return decoded.getASM(instruction)
  }

  getInstructionCycles (instruction: CPUInstruction): number {
    const opcode = instruction[0]
    return this.InstructionsCyclesTable[opcode]
  }

  getInstructionSize (opcode: number): number {
    const instruction = this.instructionsTable[opcode]
    const addressingMode = instruction.AddressingModes[opcode]

    return CPUInstructionSize[addressingMode]
  }

  private decodeAndExecute (instruction: CPUInstruction): void {
    const [opcode, operand] = instruction
    const decodedInstruction = this.decode(instruction)
    decodedInstruction.execute(opcode, operand)
  }

  private decode (instruction: CPUInstruction): BaseInstruction {
    const [opcode] = instruction
    return this.instructionsTable[opcode]
  }

  static create (control: ControlBus): NESInstructionComponent {
    return new Instruction(control)
  }
}
