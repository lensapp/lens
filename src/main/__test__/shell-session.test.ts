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

/**
 * @jest-environment jsdom
 */

import { clearKubeconfigEnvVars } from "../utils/clear-kube-env-vars";
import { resolveEnv } from "../utils/shell-env";

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

describe("resolveEnv tests", () => {
  const env = {"HOME": "/home/user", "FOO": "foo", "bar": "bar"};

  it("should resolve 1 var", () => {
    expect(resolveEnv("$HOME", env, env.HOME)).toStrictEqual("/home/user");
  });
  it("should resolve multiple vars", () => {
    expect(resolveEnv("$HOME/$FOO", env, env.HOME)).toStrictEqual("/home/user/foo");
  });
  it("should resolve lowercase var", () => {
    expect(resolveEnv("$bar", env, env.HOME)).toStrictEqual("bar");
  });
  it("should resolve ~ as $HOME", () => {
    expect(resolveEnv("~/foo", env, env.HOME)).toStrictEqual("/home/user/foo");
  });
  it("should not resolve missing var", () => {
    expect(resolveEnv("$BAR", env, env.HOME)).toStrictEqual("$BAR");
  });
  it("should not resolve var with brackets", () => {
    expect(resolveEnv("${HOME}", env, env.HOME)).toStrictEqual("${HOME}");
  });
  it("should not resolve invalid var (starts with digit)", () => {
    expect(resolveEnv("$0HOME", {"0HOME": "/home/user"})).toStrictEqual("$0HOME");
  });
});
