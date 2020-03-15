import { EventEmitter } from 'events'

class MockServer extends EventEmitter {
  listen = jest.fn((obj) => {
    if(obj.port < 9003) {
      this.emit('error', new Error("fail!"))
    } else {
      this.emit('listening', {})
    }
    return this
  })
  unref = jest.fn()
  close = jest.fn((cb) => {
    cb()
  })
}
// eslint-disable-next-line @typescript-eslint/no-var-requires
const net = require("net")
jest.mock("net")

import * as port from "../../../src/main/port"

describe("getFreePort", () => {
  beforeEach(() => {
    net.createServer.mockReturnValue(new MockServer)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("fails for an invalid range", async () => {
    return expect(port.getFreePort(1, 2)).rejects.toMatch('free port')
  })

  it("finds the next free port", async () => {
    return expect(port.getFreePort(9000, 9005)).resolves.toBe(9003)
  })
})
