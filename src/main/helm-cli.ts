import * as path from "path"
import { LensBinary, LensBinaryOpts } from "./lens-binary"

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
    return `https://get.helm.sh/helm-v${this.binaryVersion}-${this.platformName}-${this.arch}.tar.gz`
  }

  protected getBinaryPath() {
    return path.join(this.dirname, this.platformName+"-"+this.arch, this.binaryName)
  }

  protected getOriginalBinaryPath() {
    return path.join(this.dirname, this.platformName+"-"+this.arch, this.originalBinaryName)
  }
}

export const helmCli = new HelmCli("3.1.2")
