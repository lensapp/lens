import { EventEmitter } from 'events'
import { getFreePort } from "./port"
import net from "net"

jest.mock("net");

class MockServer extends EventEmitter {
  listen = jest.fn((obj) => {
    this.emit('listening', {})
    return this
  })
  address = () => {
    return { port: 12345 }
  }
  unref = jest.fn()
  close = jest.fn(cb => cb())
}

describe("getFreePort", () => {
  beforeEach(() => {
    // @ts-ignore
    // fixme: find a better way to support types for mocked module
    net.createServer.mockReturnValue(new MockServer)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("finds the next free port", async () => {
    return expect(getFreePort()).resolves.toEqual(expect.any(Number))
  })
})
