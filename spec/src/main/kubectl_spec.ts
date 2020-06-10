import { bundledKubectl, Kubectl } from "../../../src/main/kubectl";

jest.mock("electron")
jest.mock("../../../common/user-store")

describe("kubectlVersion", () => {

  it("returns bundled version if exactly same version used", async () => {
    const kubectl = new Kubectl(bundledKubectl.kubectlVersion)
    expect(kubectl.kubectlVersion).toBe(bundledKubectl.kubectlVersion)
  })

  it("returns bundled version if same major.minor version is used", async () => {
    const kubectl = new Kubectl("1.17.0")
    expect(kubectl.kubectlVersion).toBe(bundledKubectl.kubectlVersion)
  })
})
