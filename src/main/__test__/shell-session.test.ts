/**
 * @jest-environment jsdom
 */

import { clearKubeconfigEnvVars } from "../shell-session";

describe("clearKubeconfigEnvVars tests", () => {
  it("should not touch non kubeconfig keys", () => {
    expect(clearKubeconfigEnvVars({ a: 1 })).toStrictEqual({ a: 1 });
  });

  it("should remove a single kubeconfig key", () => {
    expect(clearKubeconfigEnvVars({ a: 1, kubeconfig: "1" })).toStrictEqual({ a: 1 });
  });

  it("should remove a two kubeconfig key", () => {
    expect(clearKubeconfigEnvVars({ a: 1, kubeconfig: "1", kUbeconfig: "1" })).toStrictEqual({ a: 1 });
  });
});
