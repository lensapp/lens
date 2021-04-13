import { KubeConfig } from "@kubernetes/client-node";
import { validateKubeConfig } from "../kube-helpers";

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
      it("does not raise excpetions", () => {
        expect(() => { validateKubeConfig(kc, "invalidUser", { validateUser: false });}).not.toThrow();
      });
    });
  });

  describe("with validateExec as false", () => {
    describe("with invalid exec object", () => {
      it("does not raise excpetions", () => {
        expect(() => { validateKubeConfig(kc, "invalidExec", { validateExec: false });}).not.toThrow();
      });
    });
  });
});
