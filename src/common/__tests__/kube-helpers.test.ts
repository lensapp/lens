import { KubeConfig } from "@kubernetes/client-node";
import { validateKubeConfig, loadConfig } from "../kube-helpers";

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
  name: valid
- context:
    cluster: test2
    user: test
  name: invalidCluster
- context:
    cluster: test
    user: test2
  name: invalidUser
- context:
    cluster: test
    user: invalidExec
  name: invalidExec
current-context: test
kind: Config
preferences: {}
users:
- name: test
  user:
    exec:
      command: echo
- name: invalidExec
  user:
    exec:
      command: foo
`;

const kc = new KubeConfig();

interface kubeconfig {
  apiVersion: string,
  clusters: [{
    name: string,
    cluster: {
      server: string
    }
  }],
  contexts: [{
    context: {
      cluster: string,
      user: string,
    },
    name: string
  }],
  users: [{
    name: string
  }],
  kind: string,
  "current-context": string,
  preferences: {}
}

let mockKubeConfig: kubeconfig;

describe("kube helpers", () => {
  describe("validateKubeconfig", () => {
    beforeAll(() => {
      kc.loadFromString(kubeconfig);
    });
    describe("with default validation options", () => {
      describe("with valid kubeconfig", () => {
        it("does not raise exceptions", () => {
          expect(() => { validateKubeConfig(kc, "valid");}).not.toThrow();
        });
      });
      describe("with invalid context object", () => {
        it("it raises exception", () => {
          expect(() => { validateKubeConfig(kc, "invalid");}).toThrow("No valid context object provided in kubeconfig for context 'invalid'");
        });
      });

      describe("with invalid cluster object", () => {
        it("it raises exception", () => {
          expect(() => { validateKubeConfig(kc, "invalidCluster");}).toThrow("No valid cluster object provided in kubeconfig for context 'invalidCluster'");
        });
      });

      describe("with invalid user object", () => {
        it("it raises exception", () => {
          expect(() => { validateKubeConfig(kc, "invalidUser");}).toThrow("No valid user object provided in kubeconfig for context 'invalidUser'");
        });
      });

      describe("with invalid exec command", () => {
        it("it raises exception", () => {
          expect(() => { validateKubeConfig(kc, "invalidExec");}).toThrow("User Exec command \"foo\" not found on host. Please ensure binary is found in PATH or use absolute path to binary in Kubeconfig");
        });
      });
    });

    describe("with validateCluster as false", () => {
      describe("with invalid cluster object", () => {
        it("does not raise exception", () => {
          expect(() => { validateKubeConfig(kc, "invalidCluster", { validateCluster: false });}).not.toThrow();
        });
      });
    });

    describe("with validateUser as false", () => {
      describe("with invalid user object", () => {
        it("does not raise exceptions", () => {
          expect(() => { validateKubeConfig(kc, "invalidUser", { validateUser: false });}).not.toThrow();
        });
      });
    });

    describe("with validateExec as false", () => {
      describe("with invalid exec object", () => {
        it("does not raise exceptions", () => {
          expect(() => { validateKubeConfig(kc, "invalidExec", { validateExec: false });}).not.toThrow();
        });
      });
    });
  });

  describe("pre-validate context object in kubeconfig tests", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe("Check logger.error() output", () => {
      it("invalid yaml string", () => {
        const invalidYAMLString = "fancy foo config";

        expect(() => loadConfig(invalidYAMLString)).toThrowError("must be an object");
      });
      it("empty contexts", () => {
        const emptyContexts = `apiVersion: v1\ncontexts:`;

        expect(() => loadConfig(emptyContexts)).not.toThrow();
      });
    });

    describe("Check valid kubeconfigs", () => {
      beforeEach(() => {
        mockKubeConfig = {
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
          "current-context": "minikube",
          preferences: {},
        };
      });

      it("single context is ok", async () => {
        const kc:KubeConfig = loadConfig(JSON.stringify(mockKubeConfig));

        expect(kc.getCurrentContext()).toBe("minikube");
      });

      it("multiple context is ok", async () => {
        mockKubeConfig.contexts.push({context: {cluster: "cluster-2", user: "cluster-2"}, name: "cluster-2"});
        const kc:KubeConfig = loadConfig(JSON.stringify(mockKubeConfig));

        expect(kc.getCurrentContext()).toBe("minikube");
        expect(kc.contexts.length).toBe(2);
      });
    });

    describe("Check invalid kubeconfigs", () => {
      beforeEach(() => {
        mockKubeConfig = {
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
          "current-context": "minikube",
          preferences: {},
        };
      });

      it("empty name in context causes it to be removed", async () => {
        mockKubeConfig.contexts.push({context: {cluster: "cluster-2", user: "cluster-2"}, name: ""});
        expect(mockKubeConfig.contexts.length).toBe(2);
        const kc:KubeConfig = loadConfig(JSON.stringify(mockKubeConfig));

        expect(kc.getCurrentContext()).toBe("minikube");
        expect(kc.contexts.length).toBe(1);
      });

      it("empty cluster in context causes it to be removed", async () => {
        mockKubeConfig.contexts.push({context: {cluster: "", user: "cluster-2"}, name: "cluster-2"});
        expect(mockKubeConfig.contexts.length).toBe(2);
        const kc:KubeConfig = loadConfig(JSON.stringify(mockKubeConfig));

        expect(kc.getCurrentContext()).toBe("minikube");
        expect(kc.contexts.length).toBe(1);
      });

      it("empty user in context causes it to be removed", async () => {
        mockKubeConfig.contexts.push({context: {cluster: "cluster-2", user: ""}, name: "cluster-2"});
        expect(mockKubeConfig.contexts.length).toBe(2);
        const kc:KubeConfig = loadConfig(JSON.stringify(mockKubeConfig));

        expect(kc.getCurrentContext()).toBe("minikube");
        expect(kc.contexts.length).toBe(1);
      });

      it("invalid context in between valid contexts is removed", async () => {
        mockKubeConfig.contexts.push({context: {cluster: "cluster-2", user: ""}, name: "cluster-2"});
        mockKubeConfig.contexts.push({context: {cluster: "cluster-3", user: "cluster-3"}, name: "cluster-3"});
        expect(mockKubeConfig.contexts.length).toBe(3);
        const kc:KubeConfig = loadConfig(JSON.stringify(mockKubeConfig));

        expect(kc.getCurrentContext()).toBe("minikube");
        expect(kc.contexts.length).toBe(2);
        expect(kc.contexts[0].name).toBe("minikube");
        expect(kc.contexts[1].name).toBe("cluster-3");
      });
    });
  });
});
