/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import fs from "fs";
import mockFs from "mock-fs";
import yaml from "js-yaml";
import path from "path";
import fse from "fs-extra";
import { Cluster } from "../../main/cluster";
import { ClusterStore } from "../cluster-store";
import { Console } from "console";
import { stdout, stderr } from "process";
import type { ClusterId } from "../cluster-types";
import { getCustomKubeConfigPath } from "../utils";
import { AppPaths } from "../app-paths";

console = new Console(stdout, stderr);

const testDataIcon = fs.readFileSync("test-data/cluster-store-migration-icon.png");
const kubeconfig = `
apiVersion: v1
clusters:
- cluster:
    server: https://localhost
  name: test
contexts:
- context:
    cluster: test
    user: test
  name: foo
- context:
    cluster: test
    user: test
  name: foo2
current-context: test
kind: Config
preferences: {}
users:
- name: test
  user:
    token: kubeconfig-user-q4lm4:xxxyyyy
`;

function embed(clusterId: ClusterId, contents: any): string {
  const absPath = getCustomKubeConfigPath(clusterId);

  fse.ensureDirSync(path.dirname(absPath));
  fse.writeFileSync(absPath, contents, { encoding: "utf-8", mode: 0o600 });

  return absPath;
}

jest.mock("electron", () => ({
  app: {
    getVersion: () => "99.99.99",
    getName: () => "lens",
    setName: jest.fn(),
    setPath: jest.fn(),
    getPath: () => "tmp",
    getLocale: () => "en",
    setLoginItemSettings: jest.fn(),
  },
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn(),
    removeAllListeners: jest.fn(),
    off: jest.fn(),
    send: jest.fn(),
  },
}));

AppPaths.init();

describe("empty config", () => {
  beforeEach(async () => {
    ClusterStore.getInstance(false)?.unregisterIpcListener();
    ClusterStore.resetInstance();
    const mockOpts = {
      "tmp": {
        "lens-cluster-store.json": JSON.stringify({}),
      },
    };

    mockFs(mockOpts);

    ClusterStore.createInstance();
  });

  afterEach(() => {
    mockFs.restore();
  });

  describe("with foo cluster added", () => {
    beforeEach(() => {
      ClusterStore.getInstance().addCluster(
        new Cluster({
          id: "foo",
          contextName: "foo",
          preferences: {
            terminalCWD: "/tmp",
            icon: "data:image/jpeg;base64, iVBORw0KGgoAAAANSUhEUgAAA1wAAAKoCAYAAABjkf5",
            clusterName: "minikube",
          },
          kubeConfigPath: embed("foo", kubeconfig),
        }),
      );
    });

    it("adds new cluster to store", async () => {
      const storedCluster = ClusterStore.getInstance().getById("foo");

      expect(storedCluster.id).toBe("foo");
      expect(storedCluster.preferences.terminalCWD).toBe("/tmp");
      expect(storedCluster.preferences.icon).toBe("data:image/jpeg;base64, iVBORw0KGgoAAAANSUhEUgAAA1wAAAKoCAYAAABjkf5");
    });
  });

  describe("with prod and dev clusters added", () => {
    beforeEach(() => {
      const store = ClusterStore.getInstance();

      store.addCluster({
        id: "prod",
        contextName: "foo",
        preferences: {
          clusterName: "prod",
        },
        kubeConfigPath: embed("prod", kubeconfig),
      });
      store.addCluster({
        id: "dev",
        contextName: "foo2",
        preferences: {
          clusterName: "dev",
        },
        kubeConfigPath: embed("dev", kubeconfig),
      });
    });

    it("check if store can contain multiple clusters", () => {
      expect(ClusterStore.getInstance().hasClusters()).toBeTruthy();
      expect(ClusterStore.getInstance().clusters.size).toBe(2);
    });

    it("check if cluster's kubeconfig file saved", () => {
      const file = embed("boo", "kubeconfig");

      expect(fs.readFileSync(file, "utf8")).toBe("kubeconfig");
    });
  });
});

describe("config with existing clusters", () => {
  beforeEach(() => {
    ClusterStore.resetInstance();
    const mockOpts = {
      "temp-kube-config": kubeconfig,
      "tmp": {
        "lens-cluster-store.json": JSON.stringify({
          __internal__: {
            migrations: {
              version: "99.99.99",
            },
          },
          clusters: [
            {
              id: "cluster1",
              kubeConfigPath: "./temp-kube-config",
              contextName: "foo",
              preferences: { terminalCWD: "/foo" },
              workspace: "default",
            },
            {
              id: "cluster2",
              kubeConfigPath: "./temp-kube-config",
              contextName: "foo2",
              preferences: { terminalCWD: "/foo2" },
            },
            {
              id: "cluster3",
              kubeConfigPath: "./temp-kube-config",
              contextName: "foo",
              preferences: { terminalCWD: "/foo" },
              workspace: "foo",
              ownerRef: "foo",
            },
          ],
        }),
      },
    };

    mockFs(mockOpts);

    return ClusterStore.createInstance();
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("allows to retrieve a cluster", () => {
    const storedCluster = ClusterStore.getInstance().getById("cluster1");

    expect(storedCluster.id).toBe("cluster1");
    expect(storedCluster.preferences.terminalCWD).toBe("/foo");
  });

  it("allows getting all of the clusters", async () => {
    const storedClusters = ClusterStore.getInstance().clustersList;

    expect(storedClusters.length).toBe(3);
    expect(storedClusters[0].id).toBe("cluster1");
    expect(storedClusters[0].preferences.terminalCWD).toBe("/foo");
    expect(storedClusters[1].id).toBe("cluster2");
    expect(storedClusters[1].preferences.terminalCWD).toBe("/foo2");
    expect(storedClusters[2].id).toBe("cluster3");
  });
});

describe("config with invalid cluster kubeconfig", () => {
  beforeEach(() => {
    const invalidKubeconfig = `
apiVersion: v1
clusters:
- cluster:
    server: https://localhost
  name: test2
contexts:
- context:
    cluster: test
    user: test
  name: test
current-context: test
kind: Config
preferences: {}
users:
- name: test
  user:
    token: kubeconfig-user-q4lm4:xxxyyyy
`;

    ClusterStore.resetInstance();
    const mockOpts = {
      "invalid-kube-config": invalidKubeconfig,
      "valid-kube-config": kubeconfig,
      "tmp": {
        "lens-cluster-store.json": JSON.stringify({
          __internal__: {
            migrations: {
              version: "99.99.99",
            },
          },
          clusters: [
            {
              id: "cluster1",
              kubeConfigPath: "./invalid-kube-config",
              contextName: "test",
              preferences: { terminalCWD: "/foo" },
              workspace: "foo",
            },
            {
              id: "cluster2",
              kubeConfigPath: "./valid-kube-config",
              contextName: "foo",
              preferences: { terminalCWD: "/foo" },
              workspace: "default",
            },

          ],
        }),
      },
    };

    mockFs(mockOpts);

    return ClusterStore.createInstance();
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("does not enable clusters with invalid kubeconfig", () => {
    const storedClusters = ClusterStore.getInstance().clustersList;

    expect(storedClusters.length).toBe(1);
  });
});

const minimalValidKubeConfig = JSON.stringify({
  apiVersion: "v1",
  clusters: [{
    name: "minikube",
    cluster: {
      server: "https://192.168.64.3:8443",
    },
  }],
  "current-context": "minikube",
  contexts: [{
    context: {
      cluster: "minikube",
      user: "minikube",
    },
    name: "minikube",
  }],
  users: [{
    name: "minikube",
    user: {
      "client-certificate": "/Users/foo/.minikube/client.crt",
      "client-key": "/Users/foo/.minikube/client.key",
    },
  }],
  kind: "Config",
  preferences: {},
});

describe("pre 2.0 config with an existing cluster", () => {
  beforeEach(() => {
    ClusterStore.resetInstance();
    const mockOpts = {
      "tmp": {
        "lens-cluster-store.json": JSON.stringify({
          __internal__: {
            migrations: {
              version: "1.0.0",
            },
          },
          cluster1: minimalValidKubeConfig,
        }),
      },
    };

    mockFs(mockOpts);

    return ClusterStore.createInstance();
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("migrates to modern format with kubeconfig in a file", async () => {
    const config = ClusterStore.getInstance().clustersList[0].kubeConfigPath;

    expect(fs.readFileSync(config, "utf8")).toContain(`"contexts":[`);
  });
});

describe("pre 2.6.0 config with a cluster that has arrays in auth config", () => {
  beforeEach(() => {
    ClusterStore.resetInstance();
    const mockOpts = {
      "tmp": {
        "lens-cluster-store.json": JSON.stringify({
          __internal__: {
            migrations: {
              version: "2.4.1",
            },
          },
          cluster1: {
            kubeConfig: JSON.stringify({
              apiVersion: "v1",
              clusters: [{
                cluster: {
                  server: "https://10.211.55.6:8443",
                },
                name: "minikube",
              }],
              contexts: [{
                context: {
                  cluster: "minikube",
                  user: "minikube",
                  name: "minikube",
                },
                name: "minikube",
              }],
              "current-context": "minikube",
              kind: "Config",
              preferences: {},
              users: [{
                name: "minikube",
                user: {
                  "client-certificate": "/Users/foo/.minikube/client.crt",
                  "client-key": "/Users/foo/.minikube/client.key",
                  "auth-provider": {
                    config: {
                      "access-token": [
                        "should be string",
                      ],
                      expiry: [
                        "should be string",
                      ],
                    },
                  },
                },
              }],
            }),
          },
        }),
      },
    };

    mockFs(mockOpts);

    return ClusterStore.createInstance();
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("replaces array format access token and expiry into string", async () => {
    const file = ClusterStore.getInstance().clustersList[0].kubeConfigPath;
    const config = fs.readFileSync(file, "utf8");
    const kc = yaml.load(config) as Record<string, any>;

    expect(kc.users[0].user["auth-provider"].config["access-token"]).toBe("should be string");
    expect(kc.users[0].user["auth-provider"].config["expiry"]).toBe("should be string");
  });
});

describe("pre 2.6.0 config with a cluster icon", () => {
  beforeEach(() => {
    ClusterStore.resetInstance();
    const mockOpts = {
      "tmp": {
        "lens-cluster-store.json": JSON.stringify({
          __internal__: {
            migrations: {
              version: "2.4.1",
            },
          },
          cluster1: {
            kubeConfig: minimalValidKubeConfig,
            icon: "icon_path",
            preferences: {
              terminalCWD: "/tmp",
            },
          },
        }),
        "icon_path": testDataIcon,
      },
    };

    mockFs(mockOpts);

    return ClusterStore.createInstance();
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("moves the icon into preferences", async () => {
    const storedClusterData = ClusterStore.getInstance().clustersList[0];

    expect(Object.prototype.hasOwnProperty.call(storedClusterData, "icon")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(storedClusterData.preferences, "icon")).toBe(true);
    expect(storedClusterData.preferences.icon.startsWith("data:;base64,")).toBe(true);
  });
});

describe("for a pre 2.7.0-beta.0 config without a workspace", () => {
  beforeEach(() => {
    ClusterStore.resetInstance();
    const mockOpts = {
      "tmp": {
        "lens-cluster-store.json": JSON.stringify({
          __internal__: {
            migrations: {
              version: "2.6.6",
            },
          },
          cluster1: {
            kubeConfig: minimalValidKubeConfig,
            preferences: {
              terminalCWD: "/tmp",
            },
          },
        }),
      },
    };

    mockFs(mockOpts);

    return ClusterStore.createInstance();
  });

  afterEach(() => {
    mockFs.restore();
  });
});

describe("pre 3.6.0-beta.1 config with an existing cluster", () => {
  beforeEach(() => {
    ClusterStore.resetInstance();
    const mockOpts = {
      "tmp": {
        "lens-cluster-store.json": JSON.stringify({
          __internal__: {
            migrations: {
              version: "3.5.0",
            },
          },
          clusters: [
            {
              id: "cluster1",
              kubeConfig: minimalValidKubeConfig,
              contextName: "cluster",
              preferences: {
                icon: "store://icon_path",
              },
            },
          ],
        }),
        "icon_path": testDataIcon,
      },
    };

    mockFs(mockOpts);

    return ClusterStore.createInstance();
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("migrates to modern format with kubeconfig in a file", async () => {
    const config = ClusterStore.getInstance().clustersList[0].kubeConfigPath;

    expect(fs.readFileSync(config, "utf8")).toBe(minimalValidKubeConfig);
  });

  it("migrates to modern format with icon not in file", async () => {
    const { icon } = ClusterStore.getInstance().clustersList[0].preferences;

    expect(icon.startsWith("data:;base64,")).toBe(true);
  });
});
