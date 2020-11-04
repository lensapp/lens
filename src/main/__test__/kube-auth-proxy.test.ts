const logger = {
  silly: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  crit: jest.fn(),
};

jest.mock("winston", () => ({
  format: {
    colorize: jest.fn(),
    combine: jest.fn(),
    simple: jest.fn(),
    label: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn()
  },
  createLogger: jest.fn().mockReturnValue(logger),
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  }
}))

jest.mock("../../common/ipc")
jest.mock("child_process")
jest.mock("tcp-port-used")

import { Cluster } from "../cluster"
import { KubeAuthProxy } from "../kube-auth-proxy"
import { getFreePort } from "../port"
import { broadcastIpc } from "../../common/ipc"
import { ChildProcess, spawn, SpawnOptions } from "child_process"
import { bundledKubectlPath, Kubectl } from "../kubectl"
import { mock, MockProxy } from 'jest-mock-extended';
import { waitUntilUsed } from 'tcp-port-used';
import { Readable } from "stream"

const mockBroadcastIpc = broadcastIpc as jest.MockedFunction<typeof broadcastIpc>
const mockSpawn = spawn as jest.MockedFunction<typeof spawn>
const mockWaitUntilUsed = waitUntilUsed as jest.MockedFunction<typeof waitUntilUsed>

describe("kube auth proxy tests", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("calling exit multiple times shouldn't throw", async () => {
    const port = await getFreePort()
    const kap = new KubeAuthProxy(new Cluster({ id: "foobar", kubeConfigPath: "fake-path.yml" }), port, {})
    kap.exit()
    kap.exit()
    kap.exit()
  })

  describe("spawn tests", () => {
    let port: number
    let mockedCP: MockProxy<ChildProcess>
    let listeners: Record<string, (...args: any[]) => void>

    beforeEach(async () => {
      port = await getFreePort()
      mockedCP = mock<ChildProcess>()
      listeners = {}

      jest.spyOn(Kubectl.prototype, "checkBinary").mockReturnValueOnce(Promise.resolve(true))
      jest.spyOn(Kubectl.prototype, "ensureKubectl").mockReturnValueOnce(Promise.resolve(false))
      mockedCP.on.mockImplementation((event: string, listener: (message: any, sendHandle: any) => void): ChildProcess => {
        listeners[event] = listener
        return mockedCP
      })
      mockedCP.stderr = mock<Readable>()
      mockedCP.stderr.on.mockImplementation((event: string, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners[`stderr/${event}`] = listener
        return mockedCP.stderr
      })
      mockedCP.stdout = mock<Readable>()
      mockedCP.stdout.on.mockImplementation((event: string, listener: (message: any, sendHandle: any) => void): Readable => {
        listeners[`stdout/${event}`] = listener
        return mockedCP.stdout
      })
      mockSpawn.mockImplementationOnce((command: string, args: readonly string[], options: SpawnOptions): ChildProcess => {
        expect(command).toBe(bundledKubectlPath())
        return mockedCP
      })
      mockWaitUntilUsed.mockReturnValueOnce(Promise.resolve())
    })

    it("should call spawn and broadcast errors", async () => {
      const kap = new KubeAuthProxy(new Cluster({ id: "foobar", kubeConfigPath: "fake-path.yml" }), port, {})
      await kap.run()
      listeners["error"]({ message: "foobarbat" })

      expect(mockBroadcastIpc).toBeCalledWith({ channel: "kube-auth:foobar", args: [{ data: "foobarbat", error: true }] })
    })

    it("should call spawn and broadcast exit", async () => {
      const kap = new KubeAuthProxy(new Cluster({ id: "foobar", kubeConfigPath: "fake-path.yml" }), port, {})
      await kap.run()
      listeners["exit"](0)

      expect(mockBroadcastIpc).toBeCalledWith({ channel: "kube-auth:foobar", args: [{ data: "proxy exited with code: 0", error: false }] })
    })

    it("should call spawn and broadcast errors from stderr", async () => {
      const kap = new KubeAuthProxy(new Cluster({ id: "foobar", kubeConfigPath: "fake-path.yml" }), port, {})
      await kap.run()
      listeners["stderr/data"]("an error")

      expect(mockBroadcastIpc).toBeCalledWith({ channel: "kube-auth:foobar", args: [{ data: "an error", error: true }] })
    })

    it("should call spawn and broadcast stdout serving info", async () => {
      const kap = new KubeAuthProxy(new Cluster({ id: "foobar", kubeConfigPath: "fake-path.yml" }), port, {})
      await kap.run()
      listeners["stdout/data"]("Starting to serve on")

      expect(mockBroadcastIpc).toBeCalledWith({ channel: "kube-auth:foobar", args: [{ data: "Authentication proxy started\n" }] })
    })

    it("should call spawn and broadcast stdout other info", async () => {
      const kap = new KubeAuthProxy(new Cluster({ id: "foobar", kubeConfigPath: "fake-path.yml" }), port, {})
      await kap.run()
      listeners["stdout/data"]("some info")

      expect(mockBroadcastIpc).toBeCalledWith({ channel: "kube-auth:foobar", args: [{ data: "some info" }] })
    })
  })
})
