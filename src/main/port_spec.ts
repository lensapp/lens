import { EventEmitter } from 'events'
import { getFreePort } from "./port"

jest.mock("net", () => {
  return {
    createServer() {
      return new class MockServer extends EventEmitter {
        listen = jest.fn(() => {
          this.emit('listening')
          return this
        })
        address = () => {
          return { port: 12345 }
        }
        unref = jest.fn()
        close = jest.fn(cb => cb())
      }
    },
  }
});

describe("getFreePort", () => {
  it("finds the next free port", async () => {
    return expect(getFreePort()).resolves.toEqual(expect.any(Number))
  })
})
