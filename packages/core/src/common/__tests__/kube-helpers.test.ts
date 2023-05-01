/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeConfig } from "@kubernetes/client-node";
import assert from "assert";
import { validateKubeConfig, loadConfigFromString } from "../kube-helpers";

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

interface Kubeconfig {
  apiVersion: string;
  clusters: [{
    name: string;
    cluster: {
      server: string;
    };
  }];
  contexts: [{
    context: {
      cluster: string;
      user: string;
    };
    name: string;
  }];
  users: [{
    name: string;
  }];
  kind: string;
  "current-context": string;
  preferences: object;
}

let mockKubeConfig: Kubeconfig;

describe("kube helpers", () => {
  describe("validateKubeconfig", () => {
    const kc = new KubeConfig();

    beforeAll(() => {
      kc.loadFromString(kubeconfig);
    });
    describe("with default validation options", () => {
      describe("with valid kubeconfig", () => {
        it("does not return an error", () => {
          expect(validateKubeConfig(kc, "valid").isOk).toBe(true);
        });
      });
      describe("with invalid context object", () => {
        it("returns an error", () => {
          const result = validateKubeConfig(kc, "invalid");

          assert(result.isOk === false);
          expect(result.error).toBe("No valid context object provided in kubeconfig for context 'invalid'");
        });
      });

      describe("with invalid cluster object", () => {
        it("returns an error", () => {
          const result = validateKubeConfig(kc, "invalidCluster");

          assert(result.isOk === false);
          expect(result.error).toBe("No valid cluster object provided in kubeconfig for context 'invalidCluster'");
        });
      });

      describe("with invalid user object", () => {
        it("returns an error", () => {
          const result = validateKubeConfig(kc, "invalidUser");

          assert(result.isOk === false);
          expect(result.error).toBe("No valid user object provided in kubeconfig for context 'invalidUser'");
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
        const result = loadConfigFromString(invalidYAMLString);

        expect(result.isOk).toBe(false);
      });
      it("empty contexts", () => {
        const emptyContexts = `apiVersion: v1\ncontexts: []`;
        const result = loadConfigFromString(emptyContexts);

        expect(result.isOk).toBe(true);
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

      it("single context is ok", () => {
        const result = loadConfigFromString(JSON.stringify(mockKubeConfig));

        assert(result.isOk === true);
        expect(result.value.getCurrentContext()).toBe("minikube");
      });

      it("multiple context is ok", () => {
        mockKubeConfig.contexts.push({ context: { cluster: "cluster-2", user: "cluster-2" }, name: "cluster-2" });
        const result = loadConfigFromString(JSON.stringify(mockKubeConfig));

        assert(result.isOk === true);
        expect(result.value.getCurrentContext()).toBe("minikube");
        expect(result.value.contexts.length).toBe(2);
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

      it("empty name in context causes it to be removed", () => {
        mockKubeConfig.contexts.push({ context: { cluster: "cluster-2", user: "cluster-2" }, name: "" });
        expect(mockKubeConfig.contexts.length).toBe(2);
        const result = loadConfigFromString(JSON.stringify(mockKubeConfig));

        assert(result.isOk === true);
        expect(result.value.getCurrentContext()).toBe("minikube");
        expect(result.value.contexts.length).toBe(1);
      });

      it("empty cluster in context causes it to be removed", () => {
        mockKubeConfig.contexts.push({ context: { cluster: "", user: "cluster-2" }, name: "cluster-2" });
        expect(mockKubeConfig.contexts.length).toBe(2);
        const result = loadConfigFromString(JSON.stringify(mockKubeConfig));

        assert(result.isOk === true);
        expect(result.value.getCurrentContext()).toBe("minikube");
        expect(result.value.contexts.length).toBe(1);
      });

      it("empty user in context causes it to be removed", () => {
        mockKubeConfig.contexts.push({ context: { cluster: "cluster-2", user: "" }, name: "cluster-2" });
        expect(mockKubeConfig.contexts.length).toBe(2);
        const result = loadConfigFromString(JSON.stringify(mockKubeConfig));

        assert(result.isOk === true);
        expect(result.value.getCurrentContext()).toBe("minikube");
        expect(result.value.contexts.length).toBe(1);
      });

      it("invalid context in between valid contexts is removed", () => {
        mockKubeConfig.contexts.push({ context: { cluster: "cluster-2", user: "" }, name: "cluster-2" });
        mockKubeConfig.contexts.push({ context: { cluster: "cluster-3", user: "cluster-3" }, name: "cluster-3" });
        expect(mockKubeConfig.contexts.length).toBe(3);
        const result = loadConfigFromString(JSON.stringify(mockKubeConfig));

        assert(result.isOk === true);
        expect(result.value.getCurrentContext()).toBe("minikube");
        expect(result.value.contexts.length).toBe(2);
        expect(result.value.contexts[0].name).toBe("minikube");
        expect(result.value.contexts[1].name).toBe("cluster-3");
      });
    });
  });
});
