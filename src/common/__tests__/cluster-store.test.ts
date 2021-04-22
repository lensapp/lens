import fs from "fs";
import mockFs from "mock-fs";
import yaml from "js-yaml";
import { Cluster } from "../../main/cluster";
import { ClusterStore, getClusterIdFromHost } from "../cluster-store";
import { Console } from "console";
import { stdout, stderr } from "process";

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

jest.mock("electron", () => {
  return {
    app: {
      getVersion: () => "99.99.99",
      getPath: () => "tmp",
      getLocale: () => "en",
      setLoginItemSettings: jest.fn(),
    },
    ipcMain: {
      handle: jest.fn(),
      on: jest.fn()
    }
  };
});

describe("empty config", () => {
  beforeEach(async () => {
    ClusterStore.resetInstance();
    const mockOpts = {
      "tmp": {
        "lens-cluster-store.json": JSON.stringify({})
      }
    };

    mockFs(mockOpts);

    await ClusterStore.createInstance().load();
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
            clusterName: "minikube"
          },
          kubeConfigPath: ClusterStore.embedCustomKubeConfig("foo", kubeconfig)
        })
      );
    });

    it("adds new cluster to store", async () => {
      const storedCluster = ClusterStore.getInstance().getById("foo");

      expect(storedCluster.id).toBe("foo");
      expect(storedCluster.preferences.terminalCWD).toBe("/tmp");
      expect(storedCluster.preferences.icon).toBe("data:image/jpeg;base64, iVBORw0KGgoAAAANSUhEUgAAA1wAAAKoCAYAAABjkf5");
      expect(storedCluster.enabled).toBe(true);
    });

    it("removes cluster from store", async () => {
      await ClusterStore.getInstance().removeById("foo");
      expect(ClusterStore.getInstance().getById("foo")).toBeNull();
    });

    it("sets active cluster", () => {
      ClusterStore.getInstance().setActive("foo");
      expect(ClusterStore.getInstance().active.id).toBe("foo");
    });
  });

  describe("with prod and dev clusters added", () => {
    beforeEach(() => {
      ClusterStore.getInstance().addClusters(
        new Cluster({
          id: "prod",
          contextName: "foo",
          preferences: {
            clusterName: "prod"
          },
          kubeConfigPath: ClusterStore.embedCustomKubeConfig("prod", kubeconfig)
        }),
        new Cluster({
          id: "dev",
          contextName: "foo2",
          preferences: {
            clusterName: "dev"
          },
          kubeConfigPath: ClusterStore.embedCustomKubeConfig("dev", kubeconfig)
        })
      );
    });

    it("check if store can contain multiple clusters", () => {
      expect(ClusterStore.getInstance().hasClusters()).toBeTruthy();
      expect(ClusterStore.getInstance().clusters.size).toBe(2);
    });

    it("check if cluster's kubeconfig file saved", () => {
      const file = ClusterStore.embedCustomKubeConfig("boo", "kubeconfig");

      expect(fs.readFileSync(file, "utf8")).toBe("kubeconfig");
    });
  });
});

describe("config with existing clusters", () => {
  beforeEach(() => {
    ClusterStore.resetInstance();
    const mockOpts = {
      "tmp": {
        "lens-cluster-store.json": JSON.stringify({
          __internal__: {
            migrations: {
              version: "99.99.99"
            }
          },
          clusters: [
            {
              id: "cluster1",
              kubeConfigPath: kubeconfig,
              contextName: "foo",
              preferences: { terminalCWD: "/foo" },
              workspace: "default"
            },
            {
              id: "cluster2",
              kubeConfigPath: kubeconfig,
              contextName: "foo2",
              preferences: { terminalCWD: "/foo2" }
            },
            {
              id: "cluster3",
              kubeConfigPath: kubeconfig,
              contextName: "foo",
              preferences: { terminalCWD: "/foo" },
              workspace: "foo",
              ownerRef: "foo"
            },
          ]
        })
      }
    };

    mockFs(mockOpts);

    return ClusterStore.createInstance().load();
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("allows to retrieve a cluster", () => {
    const storedCluster = ClusterStore.getInstance().getById("cluster1");

    expect(storedCluster.id).toBe("cluster1");
    expect(storedCluster.preferences.terminalCWD).toBe("/foo");
  });

  it("allows to delete a cluster", () => {
    ClusterStore.getInstance().removeById("cluster2");
    const storedCluster = ClusterStore.getInstance().getById("cluster1");

    expect(storedCluster).toBeTruthy();
    const storedCluster2 = ClusterStore.getInstance().getById("cluster2");

    expect(storedCluster2).toBeNull();
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

  it("marks owned cluster disabled by default", () => {
    const storedClusters = ClusterStore.getInstance().clustersList;

    expect(storedClusters[0].enabled).toBe(true);
    expect(storedClusters[2].enabled).toBe(false);
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
      "tmp": {
        "lens-cluster-store.json": JSON.stringify({
          __internal__: {
            migrations: {
              version: "99.99.99"
            }
          },
          clusters: [
            {
              id: "cluster1",
              kubeConfigPath: invalidKubeconfig,
              contextName: "test",
              preferences: { terminalCWD: "/foo" },
              workspace: "foo",
            },
            {
              id: "cluster2",
              kubeConfigPath: kubeconfig,
              contextName: "foo",
              preferences: { terminalCWD: "/foo" },
              workspace: "default"
            },

          ]
        })
      }
    };

    mockFs(mockOpts);

    return ClusterStore.createInstance().load();
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("does not enable clusters with invalid kubeconfig", () => {
    const storedClusters = ClusterStore.getInstance().clustersList;

    expect(storedClusters.length).toBe(2);
    expect(storedClusters[0].enabled).toBeFalsy;
    expect(storedClusters[1].id).toBe("cluster2");
    expect(storedClusters[1].enabled).toBeTruthy;
  });
});

const minimalValidKubeConfig = JSON.stringify({
  apiVersion: "v1",
  clusters: [],
  users: [],
  contexts: [],
});

describe("pre 2.0 config with an existing cluster", () => {
  beforeEach(() => {
    ClusterStore.resetInstance();
    const mockOpts = {
      "tmp": {
        "lens-cluster-store.json": JSON.stringify({
          __internal__: {
            migrations: {
              version: "1.0.0"
            }
          },
          cluster1: minimalValidKubeConfig,
        })
      }
    };

    mockFs(mockOpts);

    return ClusterStore.createInstance().load();
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("migrates to modern format with kubeconfig in a file", async () => {
    const config = ClusterStore.getInstance().clustersList[0].kubeConfigPath;

    expect(fs.readFileSync(config, "utf8")).toContain(`"contexts":[]`);
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
              version: "2.4.1"
            }
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
                        "should be string"
                      ],
                      expiry: [
                        "should be string"
                      ],
                    }
                  }
                },
              }]
            }),
          },
        })
      }
    };

    mockFs(mockOpts);

    return ClusterStore.createInstance().load();
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("replaces array format access token and expiry into string", async () => {
    const file = ClusterStore.getInstance().clustersList[0].kubeConfigPath;
    const config = fs.readFileSync(file, "utf8");
    const kc = yaml.safeLoad(config);

    console.log(kc);

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
              version: "2.4.1"
            }
          },
          cluster1: {
            kubeConfig: minimalValidKubeConfig,
            icon: "icon_path",
            preferences: {
              terminalCWD: "/tmp"
            }
          },
        }),
        "icon_path": testDataIcon,
      }
    };

    mockFs(mockOpts);

    return ClusterStore.createInstance().load();
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("moves the icon into preferences", async () => {
    const storedClusterData = ClusterStore.getInstance().clustersList[0];

    expect(storedClusterData.hasOwnProperty("icon")).toBe(false);
    expect(storedClusterData.preferences.hasOwnProperty("icon")).toBe(true);
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
              version: "2.6.6"
            }
          },
          cluster1: {
            kubeConfig: minimalValidKubeConfig,
            preferences: {
              terminalCWD: "/tmp"
            }
          },
        })
      }
    };

    mockFs(mockOpts);

    return ClusterStore.createInstance().load();
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
              version: "3.5.0"
            }
          },
          clusters: [
            {
              id: "cluster1",
              kubeConfig: minimalValidKubeConfig,
              contextName: "cluster",
              preferences: {
                icon: "store://icon_path",
              }
            }
          ]
        }),
        "icon_path": testDataIcon,
      }
    };

    mockFs(mockOpts);

    return ClusterStore.createInstance().load();
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

describe("getClusterIdFromHost", () => {
  const clusterFakeId = "fe540901-0bd6-4f6c-b472-bce1559d7c4a";

  it("should return undefined for non cluster frame hosts", () => {
    expect(getClusterIdFromHost("localhost:45345")).toBeUndefined();
  });

  it("should return ClusterId for cluster frame hosts", () => {
    expect(getClusterIdFromHost(`${clusterFakeId}.localhost:59110`)).toBe(clusterFakeId);
  });

  it("should return ClusterId for cluster frame hosts with additional subdomains", () => {
    expect(getClusterIdFromHost(`abc.${clusterFakeId}.localhost:59110`)).toBe(clusterFakeId);
    expect(getClusterIdFromHost(`abc.def.${clusterFakeId}.localhost:59110`)).toBe(clusterFakeId);
    expect(getClusterIdFromHost(`abc.def.ghi.${clusterFakeId}.localhost:59110`)).toBe(clusterFakeId);
    expect(getClusterIdFromHost(`abc.def.ghi.jkl.${clusterFakeId}.localhost:59110`)).toBe(clusterFakeId);
    expect(getClusterIdFromHost(`abc.def.ghi.jkl.mno.${clusterFakeId}.localhost:59110`)).toBe(clusterFakeId);
    expect(getClusterIdFromHost(`abc.def.ghi.jkl.mno.pqr.${clusterFakeId}.localhost:59110`)).toBe(clusterFakeId);
    expect(getClusterIdFromHost(`abc.def.ghi.jkl.mno.pqr.stu.${clusterFakeId}.localhost:59110`)).toBe(clusterFakeId);
    expect(getClusterIdFromHost(`abc.def.ghi.jkl.mno.pqr.stu.vwx.${clusterFakeId}.localhost:59110`)).toBe(clusterFakeId);
    expect(getClusterIdFromHost(`abc.def.ghi.jkl.mno.pqr.stu.vwx.yz.${clusterFakeId}.localhost:59110`)).toBe(clusterFakeId);
  });
});
