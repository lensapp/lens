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

import packageInfo from "../../../package.json";
import path from "path";
import { Kubectl } from "../kubectl";
import { isWindows } from "../../common/vars";
import { UserStore } from "../../common/user-store";

jest.mock("../../common/app-paths", () => ({
  AppPaths: {
    get: () => "tmp",
    getAsync: () => "tmp",
  },
}));

describe("kubectlVersion", () => {
  beforeEach(() => {
    UserStore.createInstance();
  });

  afterEach(() => {
    UserStore.resetInstance();
  });

  it("returns bundled version if exactly same version used", async () => {
    const kubectl = new Kubectl(Kubectl.bundled().kubectlVersion);

    expect(kubectl.kubectlVersion).toBe(Kubectl.bundled().kubectlVersion);
  });

  it("returns bundled version if same major.minor version is used", async () => {
    const { bundledKubectlVersion } = packageInfo.config;
    const kubectl = new Kubectl(bundledKubectlVersion);

    expect(kubectl.kubectlVersion).toBe(Kubectl.bundled().kubectlVersion);
  });
});

describe("getPath()", () => {
  beforeEach(() => {
    UserStore.createInstance();
  });

  afterEach(() => {
    UserStore.resetInstance();
  });

  it("returns path to downloaded kubectl binary", async () => {
    const { bundledKubectlVersion } = packageInfo.config;
    const kubectl = new Kubectl(bundledKubectlVersion);
    const kubectlPath = await kubectl.getPath();
    let binaryName = "kubectl";

    if (isWindows) {
      binaryName += ".exe";
    }
    const expectedPath = path.join(Kubectl.kubectlDir, Kubectl.bundledKubectlVersion, binaryName);

    expect(kubectlPath).toBe(expectedPath);
  });

  it("returns plain binary name if bundled kubectl is non-functional", async () => {
    const { bundledKubectlVersion } = packageInfo.config;
    const kubectl = new Kubectl(bundledKubectlVersion);

    jest.spyOn(kubectl, "getBundledPath").mockReturnValue("/invalid/path/kubectl");

    expect(await kubectl.getPath()).toBe("kubectl");
  });
});
