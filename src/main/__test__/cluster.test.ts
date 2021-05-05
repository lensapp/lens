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

jest.mock("../../common/ipc");
jest.mock("../context-handler");
jest.mock("request");
jest.mock("request-promise-native");

import { Console } from "console";
import mockFs from "mock-fs";
import { Cluster } from "../cluster";
import { Kubectl } from "../kubectl";

console = new Console(process.stdout, process.stderr); // fix mockFS

describe("create clusters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  let c: Cluster;

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
    jest.spyOn(Kubectl.prototype, "ensureKubectl").mockReturnValue(Promise.resolve(true));
    c = new Cluster({
      id: "foo",
      contextName: "minikube",
      kubeConfigPath: "minikube-config.yml"
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("should be able to create a cluster from a cluster model and apiURL should be decoded", () => {
    expect(c.apiUrl).toBe("https://192.168.64.3:8443");
  });

  it("reconnect should not throw if contextHandler is missing", () => {
    expect(() => c.reconnect()).not.toThrowError();
  });

  it("disconnect should not throw if contextHandler is missing", () => {
    expect(() => c.disconnect()).not.toThrowError();
  });

  it("activating cluster should try to connect to cluster and do a refresh", async () => {

    const c = new class extends Cluster {
      // only way to mock protected methods, without these we leak promises
      protected bindEvents() {
        return;
      }
      protected async ensureKubectl() {
        return Promise.resolve(true);
      }
    }({
      id: "foo",
      contextName: "minikube",
      kubeConfigPath: "minikube-config.yml"
    });

    c.contextHandler = {
      ensureServer: jest.fn(),
      stopServer: jest.fn()
    } as any;

    jest.spyOn(c, "reconnect");
    jest.spyOn(c, "canI");
    jest.spyOn(c, "refreshConnectionStatus");

    await c.activate();

    expect(c.reconnect).toBeCalled();
    expect(c.refreshConnectionStatus).toBeCalled();

    c.disconnect();
    jest.resetAllMocks();
  });
});
