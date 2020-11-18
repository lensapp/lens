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
jest.mock("../context-handler")
jest.mock("request")
jest.mock("request-promise-native")

import { Console } from "console";
import mockFs from "mock-fs";
import { workspaceStore } from "../../common/workspace-store";
import { Cluster } from "../cluster"
import request from "request-promise-native"
import { Kubectl } from "../kubectl";

const mockedRequest = request as jest.MockedFunction<typeof request>

console = new Console(process.stdout, process.stderr) // fix mockFS

describe("create clusters", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  beforeEach(() => {
    const mockOpts = {
      "minikube-config.yml": JSON.stringify({
        apiVersion: "v1",
        clusters: [{
          name: "minikube",
          cluster: {
            server: "https://192.168.64.3:8443",
          },
        }],
        contexts: [{
          context: {
            cluster: "minikube",
            user: "minikube",
          },
          name: "minikube",
        }],
        users: [{
          name: "minikube",
        }],
        kind: "Config",
        preferences: {},
      })
    }
    mockFs(mockOpts)
    jest.spyOn(Kubectl.prototype, "ensureKubectl").mockReturnValue(Promise.resolve(true))
  })

  afterEach(() => {
    mockFs.restore()
  })

  it("should be able to create a cluster from a cluster model and apiURL should be decoded", () => {
    const c = new Cluster({
      id: "foo",
      contextName: "minikube",
      kubeConfigPath: "minikube-config.yml",
      workspace: workspaceStore.currentWorkspaceId
    })
    expect(c.apiUrl).toBe("https://192.168.64.3:8443")
  })
})
