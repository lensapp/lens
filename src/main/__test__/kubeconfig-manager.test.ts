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

import { KubeconfigManager } from "../kubeconfig-manager"
import mockFs from "mock-fs"
import { Cluster } from "../cluster";
import { workspaceStore } from "../../common/workspace-store";
import { ContextHandler } from "../context-handler";
import { getFreePort } from "../port";
import fse from "fs-extra"
import { loadYaml } from "@kubernetes/client-node";
import { Console } from "console";

console = new Console(process.stdout, process.stderr) // fix mockFS

describe("kubeconfig manager tests", () => {
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
  })

  afterEach(() => {
    mockFs.restore()
  })

  it("should create 'temp' kube config with proxy", async () => {
    const cluster = new Cluster({
      id: "foo",
      contextName: "minikube",
      kubeConfigPath: "minikube-config.yml",
      workspace: workspaceStore.currentWorkspaceId
    })
    const contextHandler = new ContextHandler(cluster)
    const port = await getFreePort()
    const kubeConfManager = await KubeconfigManager.create(cluster, contextHandler, port)

    expect(logger.error).not.toBeCalled()
    expect(kubeConfManager.getPath()).toBe("tmp/kubeconfig-foo")
    const file = await fse.readFile(kubeConfManager.getPath())
    const yml = loadYaml<any>(file.toString())
    expect(yml["current-context"]).toBe("minikube")
    expect(yml["clusters"][0]["cluster"]["server"]).toBe(`http://127.0.0.1:${port}/foo`)
    expect(yml["users"][0]["name"]).toBe("proxy")
  })

  it("should remove 'temp' kube config on unlink and remove reference from inside class", async () => {
    const cluster = new Cluster({
      id: "foo",
      contextName: "minikube",
      kubeConfigPath: "minikube-config.yml",
      workspace: workspaceStore.currentWorkspaceId
    })
    const contextHandler = new ContextHandler(cluster)
    const port = await getFreePort()
    const kubeConfManager = await KubeconfigManager.create(cluster, contextHandler, port)

    const configPath = kubeConfManager.getPath()
    expect(await fse.pathExists(configPath)).toBe(true)
    await kubeConfManager.unlink()
    expect(await fse.pathExists(configPath)).toBe(false)
    await kubeConfManager.unlink() // doesn't throw
    expect(kubeConfManager.getPath()).toBeUndefined()
  })
})
