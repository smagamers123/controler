import { type NESModule } from 'src/nes/types'
import { type DisASMNode } from 'src/nes/disasm/types'
import { CPUMemoryMap } from 'src/nes/core/memory/consts/memory-map'
import { DebuggerNotLoaded } from '../errors/debugger-not-loaded'
import { DisASMCodeNotParsed } from '../errors/disasm-code-not-parsed'

export interface DisASMCodeRequest {
  fromAddress?: number
  fromLineNumber?: number
  numOfLines?: number
}

type Response = DisASMNode[]

export default class GetDisASMCode {
  private constructor (private readonly nes: NESModule) {}

  execute (request: DisASMCodeRequest): Response {
    const { fromAddress, fromLineNumber } = request
    const { nesDebugger } = this.nes.getComponents()

    if (nesDebugger === undefined || !nesDebugger.isActive()) {
      throw new DebuggerNotLoaded()
    }

    const { disASM } = nesDebugger.getComponents()
    const code = disASM.getCode()

    if (code.getNumOfLines() === 0) {
      throw new DisASMCodeNotParsed()
    }

    if (fromAddress !== undefined || fromLineNumber !== undefined) {
      return disASM.read(request)
    }

    const { cpu } = this.nes.getComponents().control
    const startAddress = this.nes.isPowerOn()
      ? CPUMemoryMap.PRG_ROM_START
      : cpu.getPC()

    return disASM.read({ ...request, fromAddress: startAddress })
  }

  static create (nes: NESModule): GetDisASMCode {
    return new GetDisASMCode(nes)
  }
}
