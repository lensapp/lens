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

import { KubeConfig } from "@kubernetes/client-node";
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
    const kc = new KubeConfig();

    beforeAll(() => {
      kc.loadFromString(kubeconfig);
    });
    describe("with default validation options", () => {
      describe("with valid kubeconfig", () => {
        it("does not return an error", () => {
          expect(validateKubeConfig(kc, "valid")).toBeUndefined();
        });
      });
      describe("with invalid context object", () => {
        it("returns an error", () => {
          expect(String(validateKubeConfig(kc, "invalid"))).toEqual(
            expect.stringContaining("No valid context object provided in kubeconfig for context 'invalid'"),
          );
        });
      });

      describe("with invalid cluster object", () => {
        it("returns an error", () => {
          expect(String(validateKubeConfig(kc, "invalidCluster"))).toEqual(
            expect.stringContaining("No valid cluster object provided in kubeconfig for context 'invalidCluster'"),
          );
        });
      });

      describe("with invalid user object", () => {
        it("returns an error", () => {
          expect(String(validateKubeConfig(kc, "invalidUser"))).toEqual(
            expect.stringContaining("No valid user object provided in kubeconfig for context 'invalidUser'"),
          );
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

        expect(loadConfigFromString(invalidYAMLString).error).toBeInstanceOf(Error);
      });
      it("empty contexts", () => {
        const emptyContexts = `apiVersion: v1\ncontexts: []`;

        expect(loadConfigFromString(emptyContexts).error).toBeUndefined();
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
        const { config } = loadConfigFromString(JSON.stringify(mockKubeConfig));

        expect(config.getCurrentContext()).toBe("minikube");
      });

      it("multiple context is ok", async () => {
        mockKubeConfig.contexts.push({ context: { cluster: "cluster-2", user: "cluster-2" }, name: "cluster-2" });
        const { config } = loadConfigFromString(JSON.stringify(mockKubeConfig));

        expect(config.getCurrentContext()).toBe("minikube");
        expect(config.contexts.length).toBe(2);
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
        mockKubeConfig.contexts.push({ context: { cluster: "cluster-2", user: "cluster-2" }, name: "" });
        expect(mockKubeConfig.contexts.length).toBe(2);
        const { config } = loadConfigFromString(JSON.stringify(mockKubeConfig));

        expect(config.getCurrentContext()).toBe("minikube");
        expect(config.contexts.length).toBe(1);
      });

      it("empty cluster in context causes it to be removed", async () => {
        mockKubeConfig.contexts.push({ context: { cluster: "", user: "cluster-2" }, name: "cluster-2" });
        expect(mockKubeConfig.contexts.length).toBe(2);
        const { config } = loadConfigFromString(JSON.stringify(mockKubeConfig));

        expect(config.getCurrentContext()).toBe("minikube");
        expect(config.contexts.length).toBe(1);
      });

      it("empty user in context causes it to be removed", async () => {
        mockKubeConfig.contexts.push({ context: { cluster: "cluster-2", user: "" }, name: "cluster-2" });
        expect(mockKubeConfig.contexts.length).toBe(2);
        const { config } = loadConfigFromString(JSON.stringify(mockKubeConfig));

        expect(config.getCurrentContext()).toBe("minikube");
        expect(config.contexts.length).toBe(1);
      });

      it("invalid context in between valid contexts is removed", async () => {
        mockKubeConfig.contexts.push({ context: { cluster: "cluster-2", user: "" }, name: "cluster-2" });
        mockKubeConfig.contexts.push({ context: { cluster: "cluster-3", user: "cluster-3" }, name: "cluster-3" });
        expect(mockKubeConfig.contexts.length).toBe(3);
        const { config } = loadConfigFromString(JSON.stringify(mockKubeConfig));

        expect(config.getCurrentContext()).toBe("minikube");
        expect(config.contexts.length).toBe(2);
        expect(config.contexts[0].name).toBe("minikube");
        expect(config.contexts[1].name).toBe("cluster-3");
      });
    });
  });
});
