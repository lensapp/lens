import packageInfo from "../../../package.json"
import path from "path"
import { LensBinary, LensBinaryOpts } from "../lens-binary"
import { isProduction } from "../../common/vars";

export class HelmCli extends LensBinary {

  public constructor(baseDir: string, version: string) {
    const opts: LensBinaryOpts = {
      version,
      baseDir: baseDir,
      originalBinaryName: "helm",
      newBinaryName: "helm3"
    }
    super(opts)
  }

  protected getTarName(): string | null {
    return `${this.binaryName}-v${this.binaryVersion}-${this.platformName}-${this.arch}.tar.gz`
  }

  protected getUrl() {
    return `https://get.helm.sh/helm-v${this.binaryVersion}-${this.platformName}-${this.arch}.tar.gz`
  }

  protected getBinaryPath() {
    return path.join(this.dirname, this.binaryName)
  }

  protected getOriginalBinaryPath() {
    return path.join(this.dirname, this.platformName + "-" + this.arch, this.originalBinaryName)
  }
}

const helmVersion = packageInfo.config.bundledHelmVersion;
let baseDir = process.resourcesPath;

if (!isProduction) {
  baseDir = path.join(process.cwd(), "binaries", "client");
}

export const helmCli = new HelmCli(baseDir, helmVersion);

