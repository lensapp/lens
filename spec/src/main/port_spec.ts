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
const http = require("http")
jest.mock("http")

// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require("request-promise-native")
jest.mock("request-promise-native")

import * as port from "../../../src/main/port"

describe("getFreePort", () => {
  beforeEach(() => {
    http.createServer.mockReturnValue(new MockServer)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("fails for an invalid range", async () => {
    return expect(port.getFreePort(1, 2)).rejects.toMatch('free port')
  })

  it("finds the next free port", async () => {
    request.mockReturnValue(new Promise((resolve, reject) => {
      resolve({
        body: "lens-port-checker"
      })
    }))
    return expect(port.getFreePort(9000, 9005)).resolves.toBe(9003)
  })

  it("fails with invalid response", async () => {
    request.mockReturnValue(new Promise((resolve, reject) => {
      resolve({
        body: "wrong"
      })
    }))
    return expect(port.getFreePort(9000, 9005)).rejects.toMatch('free port')
  })
})
