import { EventEmitter } from 'events'

class MockServer extends EventEmitter {
  listen = jest.fn((obj) => {
    this.emit('listening', {})
    return this
  })
  address = () => { return { port: 12345 }}
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

  it("finds the next free port", async () => {
    return expect(port.getFreePort()).resolves.toEqual(expect.any(Number))
  })
})
