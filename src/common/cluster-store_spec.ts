import mockFs from "mock-fs"
import yaml from "js-yaml"
import * as fs from "fs"
import { ClusterStore } from "./cluster-store";
import { Cluster } from "../main/cluster";

jest.mock("electron", () => {
  return {
    app: {
      getVersion: () => '99.99.99',
      getPath: () => 'tmp',
      getLocale: () => 'en'
    }
  }
})

// Console.log needs to be called before fs-mocks, see https://github.com/tschaub/mock-fs/issues/234
console.log("");

describe("for an empty config", () => {
  beforeEach(() => {
    ClusterStore.resetInstance()
    const mockOpts = {
      'tmp': {
        'lens-cluster-store.json': JSON.stringify({})
      }
    }
    mockFs(mockOpts)
  })

  afterEach(() => {
    mockFs.restore()
  })

  it("allows to store and retrieve a cluster", async () => {
    const cluster = new Cluster({
      id: 'foo',
      kubeConfigPath: 'kubeconfig',
      contextName: "foo",
      preferences: {
        terminalCWD: '/tmp',
        icon: 'path to icon'
      }
    })
    const clusterStore = ClusterStore.getInstance()
    clusterStore.storeCluster(cluster);
    const storedCluster = clusterStore.getCluster(cluster.id);
    expect(storedCluster.kubeConfigPath).toBe(cluster.kubeConfigPath)
    expect(storedCluster.contextName).toBe(cluster.contextName)
    expect(storedCluster.preferences.icon).toBe(cluster.preferences.icon)
    expect(storedCluster.preferences.terminalCWD).toBe(cluster.preferences.terminalCWD)
    expect(storedCluster.id).toBe(cluster.id)
  })

  it("allows to delete a cluster", async () => {
    const cluster = new Cluster({
      id: 'foofoo',
      kubeConfigPath: 'kubeconfig',
      contextName: "foo",
      preferences: {
        terminalCWD: '/tmp'
      }
    })
    const clusterStore = ClusterStore.getInstance()

    clusterStore.storeCluster(cluster);

    const storedCluster = clusterStore.getCluster(cluster.id);
    expect(storedCluster.id).toBe(cluster.id)

    clusterStore.removeCluster(cluster.id);

    expect(clusterStore.getCluster(cluster.id)).toBe(null)
  })
})

describe("for a config with existing clusters", () => {
  beforeEach(() => {
    ClusterStore.resetInstance()
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
              kubeConfigPath: 'foo',
              preferences: { terminalCWD: '/foo' }
            },
            {
              id: 'cluster2',
              kubeConfigPath: 'foo2',
              preferences: { terminalCWD: '/foo2' }
            }
          ]
        })
      }
    }
    mockFs(mockOpts)
  })

  afterEach(() => {
    mockFs.restore()
  })

  it("allows to retrieve a cluster", async () => {
    const clusterStore = ClusterStore.getInstance()
    const storedCluster = clusterStore.getCluster('cluster1')
    expect(storedCluster.kubeConfigPath).toBe('foo')
    expect(storedCluster.preferences.terminalCWD).toBe('/foo')
    expect(storedCluster.id).toBe('cluster1')

    const storedCluster2 = clusterStore.getCluster('cluster2')
    expect(storedCluster2.kubeConfigPath).toBe('foo2')
    expect(storedCluster2.preferences.terminalCWD).toBe('/foo2')
    expect(storedCluster2.id).toBe('cluster2')
  })

  it("allows to delete a cluster", async () => {
    const clusterStore = ClusterStore.getInstance()

    clusterStore.removeCluster('cluster2')

    // Verify the other cluster still exists:
    const storedCluster = clusterStore.getCluster('cluster1')
    expect(storedCluster.id).toBe('cluster1')

    const storedCluster2 = clusterStore.getCluster('cluster2')
    expect(storedCluster2).toBe(null)
  })

  it("allows to reload a cluster in-place", async () => {
    const cluster = new Cluster({
      id: 'cluster1',
      kubeConfigPath: 'kubeconfig string',
      contextName: "foo",
      preferences: {
        terminalCWD: '/tmp'
      }
    })

    const clusterStore = ClusterStore.getInstance()
    clusterStore.reloadCluster(cluster)

    expect(cluster.kubeConfigPath).toBe('foo')
    expect(cluster.preferences.terminalCWD).toBe('/foo')
    expect(cluster.id).toBe('cluster1')
  })

  it("allows getting all the clusters", async () => {
    const clusterStore = ClusterStore.getInstance()
    const storedClusters = clusterStore.getAllClusters()

    expect(storedClusters[0].id).toBe('cluster1')
    expect(storedClusters[0].preferences.terminalCWD).toBe('/foo')
    expect(storedClusters[0].kubeConfigPath).toBe('foo')

    expect(storedClusters[1].id).toBe('cluster2')
    expect(storedClusters[1].preferences.terminalCWD).toBe('/foo2')
    expect(storedClusters[1].kubeConfigPath).toBe('foo2')
  })

  it("allows storing the clusters in a different order", async () => {
    const clusterStore = ClusterStore.getInstance()
    const storedClusters = clusterStore.getAllClusters()

    const reorderedClusters = [storedClusters[1], storedClusters[0]]
    clusterStore.storeClusters(reorderedClusters)
    const storedClusters2 = clusterStore.getAllClusters()

    expect(storedClusters2[0].id).toBe('cluster2')
    expect(storedClusters2[1].id).toBe('cluster1')
  })
})

describe("for a pre 2.0 config with an existing cluster", () => {
  beforeEach(() => {
    ClusterStore.resetInstance()
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
    }
    mockFs(mockOpts)
  })

  afterEach(() => {
    mockFs.restore()
  })

  it("migrates to modern format with kubeconfig under a key", async () => {
    const clusterStore = ClusterStore.getInstance()
    const storedCluster = clusterStore.store.get('clusters')[0]
    expect(storedCluster.kubeConfigPath).toBe(`tmp/kubeconfigs/${storedCluster.id}`)
  })
})

describe("for a pre 2.4.1 config with an existing cluster", () => {
  beforeEach(() => {
    ClusterStore.resetInstance()
    const mockOpts = {
      'tmp': {
        'lens-cluster-store.json': JSON.stringify({
          __internal__: {
            migrations: {
              version: "2.0.0-beta.2"
            }
          },
          cluster1: {
            kubeConfig: 'foo',
            online: true,
            accessible: false,
            failureReason: 'user error'
          },
        })
      }
    }
    mockFs(mockOpts)
  })

  afterEach(() => {
    mockFs.restore()
  })

  it("migrates to modern format throwing out the state related data", async () => {
    const clusterStore = ClusterStore.getInstance()
    const storedClusterData = clusterStore.store.get('clusters')[0]
    expect(storedClusterData.hasOwnProperty('online')).toBe(false)
    expect(storedClusterData.hasOwnProperty('accessible')).toBe(false)
    expect(storedClusterData.hasOwnProperty('failureReason')).toBe(false)
  })
})

describe("for a pre 2.6.0 config with a cluster that has arrays in auth config", () => {
  beforeEach(() => {
    ClusterStore.resetInstance()
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
    mockFs(mockOpts)
  })

  afterEach(() => {
    mockFs.restore()
  })

  it("replaces array format access token and expiry into string", async () => {
    const clusterStore = ClusterStore.getInstance()
    const storedClusterData = clusterStore.store.get('clusters')[0]
    const kc = yaml.safeLoad(fs.readFileSync(storedClusterData.kubeConfigPath).toString())
    expect(kc.users[0].user['auth-provider'].config['access-token']).toBe("should be string")
    expect(kc.users[0].user['auth-provider'].config['expiry']).toBe("should be string")
    expect(storedClusterData.contextName).toBe("minikube")
  })
})

describe("for a pre 2.6.0 config with a cluster icon", () => {
  beforeEach(() => {
    ClusterStore.resetInstance()
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
            icon: "icon path",
            preferences: {
              terminalCWD: "/tmp"
            }
          },
        })
      }
    }
    mockFs(mockOpts)
  })

  afterEach(() => {
    mockFs.restore()
  })

  it("moves the icon into preferences", async () => {
    const clusterStore = ClusterStore.getInstance()
    const storedClusterData = clusterStore.store.get('clusters')[0]
    expect(storedClusterData.hasOwnProperty('icon')).toBe(false)
    expect(storedClusterData.preferences.hasOwnProperty('icon')).toBe(true)
    expect(storedClusterData.preferences.icon).toBe("icon path")
  })
})

describe("for a pre 2.7.0-beta.0 config without a workspace", () => {
  beforeEach(() => {
    ClusterStore.resetInstance()
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
            icon: "icon path",
            preferences: {
              terminalCWD: "/tmp"
            }
          },
        })
      }
    }
    mockFs(mockOpts)
  })

  afterEach(() => {
    mockFs.restore()
  })

  it("adds cluster to default workspace", async () => {
    const clusterStore = ClusterStore.getInstance()
    const storedClusterData = clusterStore.store.get("clusters")[0]
    expect(storedClusterData.workspace).toBe('default')
  })
})
