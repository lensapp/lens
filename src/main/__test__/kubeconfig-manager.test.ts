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
}));

import { KubeconfigManager } from "../kubeconfig-manager";
import mockFs from "mock-fs";
import { Cluster } from "../cluster";
import { ContextHandler } from "../context-handler";
import fse from "fs-extra";
import { loadYaml } from "@kubernetes/client-node";
import { Console } from "console";
import * as path from "path";

console = new Console(process.stdout, process.stderr); // fix mockFS

describe("kubeconfig manager tests", () => {
  let cluster: Cluster;
  let contextHandler: ContextHandler;

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
    };

    mockFs(mockOpts);

    cluster = new Cluster({
      id: "foo",
      contextName: "minikube",
      kubeConfigPath: "minikube-config.yml",
    });
    contextHandler = jest.fn() as any;
    jest.spyOn(KubeconfigManager.prototype, "resolveProxyUrl", "get").mockReturnValue("http://127.0.0.1:9191/foo");
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("should create 'temp' kube config with proxy", async () => {
    const kubeConfManager = new KubeconfigManager(cluster, contextHandler);

    expect(logger.error).not.toBeCalled();
    expect(await kubeConfManager.getPath()).toBe(`tmp${path.sep}kubeconfig-foo`);
    // this causes an intermittent "ENXIO: no such device or address, read" error
    //    const file = await fse.readFile(await kubeConfManager.getPath());
    const file = fse.readFileSync(await kubeConfManager.getPath());
    const yml = loadYaml<any>(file.toString());

    expect(yml["current-context"]).toBe("minikube");
    expect(yml["clusters"][0]["cluster"]["server"].endsWith("/foo")).toBe(true);
    expect(yml["users"][0]["name"]).toBe("proxy");
  });

  it("should remove 'temp' kube config on unlink and remove reference from inside class", async () => {
    const kubeConfManager = new KubeconfigManager(cluster, contextHandler);
    const configPath = await kubeConfManager.getPath();

    expect(await fse.pathExists(configPath)).toBe(true);
    await kubeConfManager.unlink();
    expect(await fse.pathExists(configPath)).toBe(false);
    await kubeConfManager.unlink(); // doesn't throw
    expect(async () => {
      await kubeConfManager.getPath();
    }).rejects.toThrow("already unlinked");
  });
});
