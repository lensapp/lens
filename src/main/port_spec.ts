import { EventEmitter } from "events";
import { getFreePort } from "./port";

let newPort = 0;

jest.mock("net", () => {
  return {
    createServer() {
      return new class MockServer extends EventEmitter {
        listen = jest.fn(() => {
          this.emit("listening");
          return this;
        });
        address = () => {
          newPort = Math.round(Math.random() * 10000);
          return {
            port: newPort
          };
        };
        unref = jest.fn();
        close = jest.fn(cb => cb());
      };
    },
  };
});

describe("getFreePort", () => {
  it("finds the next free port", async () => {
    return expect(getFreePort()).resolves.toEqual(newPort);
  });
});
