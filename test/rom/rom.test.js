import { ROM } from '../../src/rom/rom'
import { FileLoader } from '../../src/utils/file-loader'

describe('Tests for the ROM module.', () => {
  test('should allow to load a valid .nes ROM file: NROM', async () => {
    const testROMFile = './test/__roms__/nestest.nes'
    const fileLoader = FileLoader(testROMFile)

    const rom = await ROM(fileLoader)
    const romInfo = rom.getHeader()

    expect(romInfo).toEqual({
      isValid: true,
      numOfPRG: 1,
      numOfCHR: 1,
      hasBatteryBacked: false,
      hasTrainer: false,
      size: 24592,
      prgSize: 16384,
      chrSize: 8192,
      mapper: {
        code: 0x00,
        name: 'NROM'
      }
    })
  })

  test('should allow to load a valid .nes ROM file: MMC1', async () => {
    const testROMFile = './test/__roms__/instr_test-v3/official_only.nes'
    const fileLoader = FileLoader(testROMFile)

    const rom = await ROM(fileLoader)
    const romInfo = rom.getHeader()

    expect(romInfo).toEqual({
      isValid: true,
      numOfPRG: 16,
      numOfCHR: 0,
      hasBatteryBacked: false,
      hasTrainer: false,
      size: 262160,
      prgSize: 262144,
      chrSize: 0,
      mapper: {
        code: 0x01,
        name: 'MMC1'
      }
    })
  })

  test('should build an invalid INES header when load an malformed .nes ROM', async () => {
    const testROMFile = './test/__roms__/invalid_rom.nes'
    const fileLoader = FileLoader(testROMFile)

    const rom = await ROM(fileLoader)
    const romInfo = rom.getHeader()

    expect(romInfo).toEqual({
      isValid: false
    })
  })

  test('should throw an error when load an non-existent .nes ROM', async () => {
    const testROMFile = './test/__roms__/non_existent.nes'
    const fileLoader = FileLoader(testROMFile)

    try {
      await ROM(fileLoader)
      expect(true).toBe(false)
    } catch (error) {
      expect(error.message).toBe('Cannot load the rom file')
    }
  })

  test('should get an empty ROM buffer from an invalid .nes ROM', async () => {
    const testROMFile = './test/__roms__/invalid_rom.nes'
    const fileLoader = FileLoader(testROMFile)

    const rom = await ROM(fileLoader)
    const { buffer, size } = rom.getPRG()

    expect(size).toBe(0x00)
    expect(buffer.equals(Buffer.from([]))).toBe(true)
  })

  test('should build the ROM buffer: NROM-128', async () => {
    // NROM with a single PRG bank (16k). Mirroring needed
    const testROMFile = './test/__roms__/nestest.nes'
    const fileLoader = FileLoader(testROMFile)
    const prgFirstBytes = new Uint8Array([0x4c, 0xf5, 0xc5, 0x60, 0x78, 0xd8])
    const prgLastBytes = new Uint8Array([0xaf, 0xc5, 0x04, 0xc0, 0xf4, 0xc5])

    const rom = await ROM(fileLoader)
    const { buffer, size } = rom.getPRG()
    const firstBytes = buffer.subarray(0x0000, 0x0006)
    const lastBytes = buffer.subarray(0x7ffa, 0x8000)

    expect(size).toBe(0x8000)
    expect(firstBytes.equals(prgFirstBytes)).toBe(true)
    expect(lastBytes.equals(prgLastBytes)).toBe(true)
  })

  test('should build the ROM buffer: NROM-256', async () => {
    // NROM with two PRG bank (32k). Mirroring not needed
    const testROMFile = './test/__roms__/cpu_reset/registers.nes'
    const fileLoader = FileLoader(testROMFile)

    const rom = await ROM(fileLoader)
    const { buffer, size } = rom.getPRG()
    const bufferA = buffer.subarray(0x0000, 0x4000)
    const bufferB = buffer.subarray(0x4000, 0x8000)

    expect(size).toBe(0x8000)
    expect(bufferA.equals(bufferB)).toBe(false)
  })
})
