import packageInfo from "../../package.json"
import { Kubectl } from "../../src/main/kubectl";

jest.mock("../common/user-store");

describe("kubectlVersion", () => {
  it("returns bundled version if exactly same version used", async () => {
    const kubectl = new Kubectl(Kubectl.bundled.kubectlVersion)
    expect(kubectl.kubectlVersion).toBe(Kubectl.bundled.kubectlVersion)
  })

  it("returns bundled version if same major.minor version is used", async () => {
    const { bundledKubectlVersion } = packageInfo.config;
    const kubectl = new Kubectl(bundledKubectlVersion);
    expect(kubectl.kubectlVersion).toBe(Kubectl.bundled.kubectlVersion)
  })
})
