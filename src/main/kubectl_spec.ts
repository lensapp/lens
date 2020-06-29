import packageInfo from "../../package.json"
import { bundledKubectl, Kubectl } from "../../src/main/kubectl";
import { UserStore } from "../common/user-store";

jest.mock("../common/user-store", () => {
  const userStoreMock: Partial<UserStore> = {
    getPreferences() {
      return {
        downloadMirror: "default"
      }
    }
  }
  return {
    userStore: userStoreMock,
  }
})

describe("kubectlVersion", () => {
  it("returns bundled version if exactly same version used", async () => {
    const kubectl = new Kubectl(bundledKubectl.kubectlVersion)
    expect(kubectl.kubectlVersion).toBe(bundledKubectl.kubectlVersion)
  })

  it("returns bundled version if same major.minor version is used", async () => {
    const { bundledKubectlVersion } = packageInfo.config;
    const kubectl = new Kubectl(bundledKubectlVersion);
    expect(kubectl.kubectlVersion).toBe(bundledKubectl.kubectlVersion)
  })
})
