jest.mock("electron")
jest.mock("../../../src/common/user-store")

import { Kubectl, bundledKubectl } from "../../../src/main/kubectl"

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
