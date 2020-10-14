import packageInfo from "../../package.json"
import path from "path"
import { Kubectl } from "../../src/main/kubectl";
import { isWindows } from "../common/vars";

jest.mock("../common/user-store");

describe("kubectlVersion", () => {
  it("returns bundled version if exactly same version used", async () => {
    const kubectl = new Kubectl(Kubectl.bundled().kubectlVersion)
    expect(kubectl.kubectlVersion).toBe(Kubectl.bundled().kubectlVersion)
  })

  it("returns bundled version if same major.minor version is used", async () => {
    const { bundledKubectlVersion } = packageInfo.config;
    const kubectl = new Kubectl(bundledKubectlVersion);
    expect(kubectl.kubectlVersion).toBe(Kubectl.bundled().kubectlVersion)
  })
})

describe("getPath()", () => {
  it("returns path to downloaded kubectl binary", async () => {
    const { bundledKubectlVersion } = packageInfo.config;
    const kubectl = new Kubectl(bundledKubectlVersion);
    const kubectlPath = await kubectl.getPath()
    let binaryName = "kubectl"
    if (isWindows) {
      binaryName += ".exe"
    }
    const expectedPath = path.join(Kubectl.kubectlDir, Kubectl.bundledKubectlVersion, binaryName)
    expect(kubectlPath).toBe(expectedPath)
  })

  it("returns plain binary name if bundled kubectl is non-functional", async () => {
    const { bundledKubectlVersion } = packageInfo.config;
    const kubectl = new Kubectl(bundledKubectlVersion);
    jest.spyOn(kubectl, "getBundledPath").mockReturnValue("/invalid/path/kubectl")
    const kubectlPath = await kubectl.getPath()
    let binaryName = "kubectl"
    if (isWindows) {
      binaryName += ".exe"
    }
    expect(kubectlPath).toBe(binaryName)
  })
})
