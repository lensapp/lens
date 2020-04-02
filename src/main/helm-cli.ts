import * as path from "path"
import { LensBinary, LensBinaryOpts } from "./lens-binary"
import { userStore } from "../common/user-store"

const helmVersion = "3.1.2"
const packageMirrors: Map<string, string> = new Map([
  ["default", "https://get.helm.sh"],
  ["china", "https://mirror.azure.cn/kubernetes/helm"]
])

export class HelmCli extends LensBinary {

  public constructor(version: string) {
    const opts: LensBinaryOpts = {
      version,
      originalBinaryName: "helm",
      newBinaryName: "helm3"
    }
    super(opts)
  }
  protected getTarName(): string|null {
    return `${this.binaryName}-v${this.binaryVersion}-${this.platformName}-${this.arch}.tar.gz`
  }

  protected getUrl() {
    return `${this.getDownloadMirror()}/helm-v${this.binaryVersion}-${this.platformName}-${this.arch}.tar.gz`
  }

  protected getDownloadMirror() {
    const mirror = packageMirrors.get(userStore.getPreferences().downloadMirror)
    if (mirror) { return mirror }

    return packageMirrors.get("default")
  }

  protected getBinaryPath() {
    return path.join(this.dirname, this.platformName+"-"+this.arch, this.binaryName)
  }

  protected getOriginalBinaryPath() {
    return path.join(this.dirname, this.platformName+"-"+this.arch, this.originalBinaryName)
  }
}

export const helmCli = new HelmCli(helmVersion)
