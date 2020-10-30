import fs from "fs";
import mockFs from "mock-fs";
import yaml from "js-yaml";
import { Cluster } from "../../main/cluster";
import { ClusterStore } from "../cluster-store";
import { workspaceStore } from "../workspace-store";

const testDataIcon = fs.readFileSync("test-data/cluster-store-migration-icon.png")

console.log("") // fix bug

let clusterStore: ClusterStore;

describe("empty config", () => {
  beforeEach(() => {
    ClusterStore.resetInstance();
    const mockOpts = {
      'tmp': {
        'lens-cluster-store.json': JSON.stringify({})
      }
    }
    mockFs(mockOpts);
    clusterStore = ClusterStore.getInstance<ClusterStore>();
    return clusterStore.load();
  })

  afterEach(() => {
    mockFs.restore();
  })

  describe("with foo cluster added", () => {
    beforeEach(() => {
      clusterStore.addCluster(
        new Cluster({
          id: "foo",
          contextName: "minikube",
          preferences: {
            terminalCWD: "/tmp",
            icon: "data:image/jpeg;base64, iVBORw0KGgoAAAANSUhEUgAAA1wAAAKoCAYAAABjkf5",
            clusterName: "minikube"
          },
          kubeConfigPath: ClusterStore.embedCustomKubeConfig("foo", "fancy foo config"),
          workspace: workspaceStore.currentWorkspaceId
        })
      );
    })

    it("adds new cluster to store", async () => {
      const storedCluster = clusterStore.getById("foo");
      expect(storedCluster.id).toBe("foo");
      expect(storedCluster.preferences.terminalCWD).toBe("/tmp");
      expect(storedCluster.preferences.icon).toBe("data:image/jpeg;base64, iVBORw0KGgoAAAANSUhEUgAAA1wAAAKoCAYAAABjkf5");
    })

    it("adds cluster to default workspace", () => {
      const storedCluster = clusterStore.getById("foo");
      expect(storedCluster.workspace).toBe("default");
    })

    it("removes cluster from store", async () => {
      await clusterStore.removeById("foo");
      expect(clusterStore.getById("foo")).toBeUndefined();
    })

    it("sets active cluster", () => {
      clusterStore.setActive("foo");
      expect(clusterStore.active.id).toBe("foo");
    })
  })

  describe("with prod and dev clusters added", () => {
    beforeEach(() => {
      clusterStore.addClusters(
        new Cluster({
          id: "prod",
          contextName: "prod",
          preferences: {
            clusterName: "prod"
          },
          kubeConfigPath: ClusterStore.embedCustomKubeConfig("prod", "fancy config"),
          workspace: "workstation"
        }),
        new Cluster({
          id: "dev",
          contextName: "dev",
          preferences: {
            clusterName: "dev"
          },
          kubeConfigPath: ClusterStore.embedCustomKubeConfig("dev", "fancy config"),
          workspace: "workstation"
        })
      )
    })

    it("check if store can contain multiple clusters", () => {
      expect(clusterStore.hasClusters()).toBeTruthy();
      expect(clusterStore.clusters.size).toBe(2);
    });

    it("gets clusters by workspaces", () => {
      const wsClusters = clusterStore.getByWorkspaceId("workstation");
      const defaultClusters = clusterStore.getByWorkspaceId("default");
      expect(defaultClusters.length).toBe(0);
      expect(wsClusters.length).toBe(2);
      expect(wsClusters[0].id).toBe("prod");
      expect(wsClusters[1].id).toBe("dev");
    })

    it("check if cluster's kubeconfig file saved", () => {
      const file = ClusterStore.embedCustomKubeConfig("boo", "kubeconfig");
      expect(fs.readFileSync(file, "utf8")).toBe("kubeconfig");
    })

    it("check if reorderring works for same from and to", () => {
      clusterStore.swapIconOrders("workstation", 1, 1)

      const clusters = clusterStore.getByWorkspaceId("workstation");
      expect(clusters[0].id).toBe("prod")
      expect(clusters[0].preferences.iconOrder).toBe(0)
      expect(clusters[1].id).toBe("dev")
      expect(clusters[1].preferences.iconOrder).toBe(1)
    })

    it("check if reorderring works for different from and to", () => {
      clusterStore.swapIconOrders("workstation", 0, 1)

      const clusters = clusterStore.getByWorkspaceId("workstation");
      expect(clusters[0].id).toBe("dev")
      expect(clusters[0].preferences.iconOrder).toBe(0)
      expect(clusters[1].id).toBe("prod")
      expect(clusters[1].preferences.iconOrder).toBe(1)
    })

    it("check if after icon reordering, changing workspaces still works", () => {
      clusterStore.swapIconOrders("workstation", 1, 1)
      clusterStore.getById("prod").workspace = "default"

      expect(clusterStore.getByWorkspaceId("workstation").length).toBe(1);
      expect(clusterStore.getByWorkspaceId("default").length).toBe(1);
    })
  })
})

describe("config with existing clusters", () => {
  beforeEach(() => {
    ClusterStore.resetInstance();
    const mockOpts = {
      'tmp': {
        'lens-cluster-store.json': JSON.stringify({
          __internal__: {
            migrations: {
              version: "99.99.99"
            }
          },
          clusters: [
            {
              id: 'cluster1',
              kubeConfig: 'foo',
              contextName: 'foo',
              preferences: { terminalCWD: '/foo' },
              workspace: 'default'
            },
            {
              id: 'cluster2',
              kubeConfig: 'foo2',
              contextName: 'foo2',
              preferences: { terminalCWD: '/foo2' }
            },
            {
              id: 'cluster3',
              kubeConfig: 'foo',
              contextName: 'foo',
              preferences: { terminalCWD: '/foo' },
              workspace: 'foo'
            },
          ]
        })
      }
    }
    mockFs(mockOpts);
    clusterStore = ClusterStore.getInstance<ClusterStore>();
    return clusterStore.load();
  })

  afterEach(() => {
    mockFs.restore();
  })

  it("allows to retrieve a cluster", () => {
    const storedCluster = clusterStore.getById('cluster1');
    expect(storedCluster.id).toBe('cluster1');
    expect(storedCluster.preferences.terminalCWD).toBe('/foo');
  })

  it("allows to delete a cluster", () => {
    clusterStore.removeById('cluster2');
    const storedCluster = clusterStore.getById('cluster1');
    expect(storedCluster).toBeTruthy();
    const storedCluster2 = clusterStore.getById('cluster2');
    expect(storedCluster2).toBeUndefined();
  })

  it("allows getting all of the clusters", async () => {
    const storedClusters = clusterStore.clustersList;
    expect(storedClusters.length).toBe(3)
    expect(storedClusters[0].id).toBe('cluster1')
    expect(storedClusters[0].preferences.terminalCWD).toBe('/foo')
    expect(storedClusters[1].id).toBe('cluster2')
    expect(storedClusters[1].preferences.terminalCWD).toBe('/foo2')
    expect(storedClusters[2].id).toBe('cluster3')
  })
})

describe("pre 2.0 config with an existing cluster", () => {
  beforeEach(() => {
    ClusterStore.resetInstance();
    const mockOpts = {
      'tmp': {
        'lens-cluster-store.json': JSON.stringify({
          __internal__: {
            migrations: {
              version: "1.0.0"
            }
          },
          cluster1: 'kubeconfig content'
        })
      }
    };
    mockFs(mockOpts);
    clusterStore = ClusterStore.getInstance<ClusterStore>();
    return clusterStore.load();
  })

  afterEach(() => {
    mockFs.restore();
  })

  it("migrates to modern format with kubeconfig in a file", async () => {
    const config = clusterStore.clustersList[0].kubeConfigPath;
    expect(fs.readFileSync(config, "utf8")).toBe("kubeconfig content");
  })
})

describe("pre 2.6.0 config with a cluster that has arrays in auth config", () => {
  beforeEach(() => {
    ClusterStore.resetInstance();
    const mockOpts = {
      'tmp': {
        'lens-cluster-store.json': JSON.stringify({
          __internal__: {
            migrations: {
              version: "2.4.1"
            }
          },
          cluster1: {
            kubeConfig: "apiVersion: v1\nclusters:\n- cluster:\n    server: https://10.211.55.6:8443\n  name: minikube\ncontexts:\n- context:\n    cluster: minikube\n    user: minikube\n  name: minikube\ncurrent-context: minikube\nkind: Config\npreferences: {}\nusers:\n- name: minikube\n  user:\n    client-certificate: /Users/kimmo/.minikube/client.crt\n    client-key: /Users/kimmo/.minikube/client.key\n    auth-provider:\n      config:\n        access-token:\n          - should be string\n        expiry:\n          - should be string\n"
          },
        })
      }
    }
    mockFs(mockOpts);
    clusterStore = ClusterStore.getInstance<ClusterStore>();
    return clusterStore.load();
  })

  afterEach(() => {
    mockFs.restore();
  })

  it("replaces array format access token and expiry into string", async () => {
    const file = clusterStore.clustersList[0].kubeConfigPath;
    const config = fs.readFileSync(file, "utf8");
    const kc = yaml.safeLoad(config);
    expect(kc.users[0].user['auth-provider'].config['access-token']).toBe("should be string");
    expect(kc.users[0].user['auth-provider'].config['expiry']).toBe("should be string");
  })
})

describe("pre 2.6.0 config with a cluster icon", () => {
  beforeEach(() => {
    ClusterStore.resetInstance();
    const mockOpts = {
      'tmp': {
        'lens-cluster-store.json': JSON.stringify({
          __internal__: {
            migrations: {
              version: "2.4.1"
            }
          },
          cluster1: {
            kubeConfig: "foo",
            icon: "icon_path",
            preferences: {
              terminalCWD: "/tmp"
            }
          },
        }),
        "icon_path": testDataIcon,
      }
    }
    mockFs(mockOpts);
    clusterStore = ClusterStore.getInstance<ClusterStore>();
    return clusterStore.load();
  })

  afterEach(() => {
    mockFs.restore();
  })

  it("moves the icon into preferences", async () => {
    const storedClusterData = clusterStore.clustersList[0];
    expect(storedClusterData.hasOwnProperty('icon')).toBe(false);
    expect(storedClusterData.preferences.hasOwnProperty('icon')).toBe(true);
    expect(storedClusterData.preferences.icon.startsWith("data:;base64,")).toBe(true);
  })
})

describe("for a pre 2.7.0-beta.0 config without a workspace", () => {
  beforeEach(() => {
    ClusterStore.resetInstance();
    const mockOpts = {
      'tmp': {
        'lens-cluster-store.json': JSON.stringify({
          __internal__: {
            migrations: {
              version: "2.6.6"
            }
          },
          cluster1: {
            kubeConfig: "foo",
            preferences: {
              terminalCWD: "/tmp"
            }
          },
        })
      }
    }
    mockFs(mockOpts);
    clusterStore = ClusterStore.getInstance<ClusterStore>();
    return clusterStore.load();
  })

  afterEach(() => {
    mockFs.restore();
  })

  it("adds cluster to default workspace", async () => {
    const storedClusterData = clusterStore.clustersList[0];
    expect(storedClusterData.workspace).toBe('default');
  })
})

describe("pre 3.6.0-beta.1 config with an existing cluster", () => {
  beforeEach(() => {
    ClusterStore.resetInstance();
    const mockOpts = {
      'tmp': {
        'lens-cluster-store.json': JSON.stringify({
          __internal__: {
            migrations: {
              version: "3.5.0"
            }
          },
          clusters: [
            {
              id: 'cluster1',
              kubeConfig: 'kubeconfig content',
              contextName: 'cluster',
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
    clusterStore = ClusterStore.getInstance<ClusterStore>();
    return clusterStore.load();
  })

  afterEach(() => {
    mockFs.restore();
  })

  it("migrates to modern format with kubeconfig in a file", async () => {
    const config = clusterStore.clustersList[0].kubeConfigPath;
    expect(fs.readFileSync(config, "utf8")).toBe("kubeconfig content");
  })

  it("migrates to modern format with icon not in file", async () => {
    const { icon } = clusterStore.clustersList[0].preferences;
    expect(icon.startsWith("data:;base64,")).toBe(true);
  })
})
