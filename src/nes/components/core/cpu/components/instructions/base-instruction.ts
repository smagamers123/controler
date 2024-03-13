import { type NESControlBus } from 'src/nes/components/core/control-bus/types'
import { type NESMemoryComponent } from 'src/nes/components/core/memory/types'
import {
  type CPUInstruction,
  type CPUAddrModeTable,
  type CPUState,
  type CPUAddrMode,
  type NESCpuComponent,
  type NESAluComponent
} from '../../types'

export abstract class BaseInstruction {
  protected readonly _cpuState: CPUState
  protected readonly opcodesWithExtraCycles?: number[]

  constructor (private readonly control: NESControlBus) {
    this._cpuState = this.control.cpu.getCPUState()
  }

  public abstract readonly name: string
  public abstract readonly AddressingModes: CPUAddrModeTable

  public abstract execute (...args: CPUInstruction): void
  public updateStatus? (...args: number[]): void

  protected addBranchExtraCycles (displacement: number): void {
    const currentPC = this.control.cpu.getPC()
    const hasCrossedPage = this.control.memory.hasCrossedPage(
      currentPC,
      currentPC + displacement
    )

    this.cpuState.clock.lastExtraCycles += hasCrossedPage ? 2 : 1
  }

  protected addInstructionExtraCycles (
    addrMode: CPUAddrMode,
    opcode: number,
    operand: number
  ): void {
    if (
      this.opcodesWithExtraCycles === undefined ||
      !this.opcodesWithExtraCycles.includes(opcode)
    ) {
      return
    }

    const hasExtraCycle = this.control.memory.hasExtraCycleByAddressingMode(
      addrMode,
      operand
    )
    this.cpuState.clock.lastExtraCycles += hasExtraCycle ? 1 : 0
  }

  protected get cpu (): NESCpuComponent {
    return this.control.cpu
  }

  protected get cpuState (): CPUState {
    return this._cpuState
  }

  protected get alu (): NESAluComponent {
    return this.control.alu
  }

  protected get memory (): NESMemoryComponent {
    return this.control.memory
  }
}
