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
import { ContextHandler } from "../context-handler";
import { getFreePort } from "../port";
import { V1ResourceAttributes } from "@kubernetes/client-node";
import { apiResources } from "../../common/rbac";
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

  it("init should not throw if everything is in order", async () => {
    const c = new Cluster({
      id: "foo",
      contextName: "minikube",
      kubeConfigPath: "minikube-config.yml",
      workspace: workspaceStore.currentWorkspaceId
    })
    await c.init(await getFreePort())
    expect(logger.info).toBeCalledWith(expect.stringContaining("init success"), {
      id: "foo",
      apiUrl: "https://192.168.64.3:8443",
      context: "minikube",
    })
  })

  it("activating cluster should try to connect to cluster and do a refresh", async () => {
    const port = await getFreePort()
    jest.spyOn(ContextHandler.prototype, "ensureServer");

    const mockListNSs = jest.fn()
    const mockKC = {
      makeApiClient() {
        return {
          listNamespace: mockListNSs,
        }
      }
    }
    jest.spyOn(Cluster.prototype, "isClusterAdmin").mockReturnValue(Promise.resolve(true))
    jest.spyOn(Cluster.prototype, "canI")
      .mockImplementationOnce((attr: V1ResourceAttributes): Promise<boolean> => {
        expect(attr.namespace).toBe("default")
        expect(attr.resource).toBe("pods")
        expect(attr.verb).toBe("list")
        return Promise.resolve(true)
      })
      .mockImplementation((attr: V1ResourceAttributes): Promise<boolean> => {
        expect(attr.namespace).toBe("default")
        expect(attr.verb).toBe("list")
        return Promise.resolve(true)
      })
    jest.spyOn(Cluster.prototype, "getProxyKubeconfig").mockReturnValue(mockKC as any)
    mockListNSs.mockImplementationOnce(() => ({
      body: {
        items: [{
          metadata: {
            name: "default",
          }
        }]
      }
    }))

    mockedRequest.mockImplementationOnce(((uri: any, _options: any) => {
      expect(uri).toBe(`http://localhost:${port}/api-kube/version`)
      return Promise.resolve({ gitVersion: "1.2.3" })
    }) as any)

    const c = new Cluster({
      id: "foo",
      contextName: "minikube",
      kubeConfigPath: "minikube-config.yml",
      workspace: workspaceStore.currentWorkspaceId
    })
    await c.init(port)
    await c.activate()

    expect(ContextHandler.prototype.ensureServer).toBeCalled()
    expect(mockedRequest).toBeCalled()
    expect(c.accessible).toBe(true)
    expect(c.allowedNamespaces.length).toBe(1)
    expect(c.allowedResources.length).toBe(apiResources.length)
    c.disconnect()
    jest.resetAllMocks()
  })
})
