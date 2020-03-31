import { app, remote } from "electron"
import * as path from "path"
import * as fs from "fs"
import * as request from "request"
import logger from "./logger"
import { ensureDir, pathExists } from "fs-extra"
import * as tar from "tar"
import { globalRequestOpts} from "../common/request"

export type LensBinaryOpts = {
  version: string;
  originalBinaryName: string;
  newBinaryName?: string;
}
export class LensBinary {

  public binaryVersion: string
  protected directory: string
  protected url: string
  protected path: string;
  protected tarPath: string;
  protected dirname: string
  protected binaryName: string
  protected platformName: string
  protected arch: string
  protected originalBinaryName: string

  constructor(opts: LensBinaryOpts) {
    this.originalBinaryName = opts.originalBinaryName
    this.binaryName = opts.newBinaryName || opts.originalBinaryName

    this.binaryVersion = opts.version

    let arch = null

    if(process.arch == "x64") {
      arch = "amd64"
    } else if(process.arch == "x86" || process.arch == "ia32") {
      arch = "386"
    } else {
      arch = process.arch
    }
    this.arch = arch
    const binaryDir = path.join((app || remote.app).getPath("userData"), "binaries", this.binaryName)
    this.platformName = process.platform === "win32" ? "windows" : process.platform
    if (process.platform === "win32") {
      this.binaryName = this.binaryName+".exe"
      this.originalBinaryName = this.originalBinaryName+".exe"
    }

    this.dirname = path.normalize(path.join(binaryDir, this.binaryVersion))
    const tarName = this.getTarName()
    if (tarName) {
      this.tarPath = path.join(this.dirname, tarName)
    }
  }

  public async binaryPath() {
    await this.ensureBinary()
    return this.getBinaryPath()
  }

  protected getTarName(): string|null {
    return null
  }

  protected getUrl() {
    return ""
  }

  protected getBinaryPath() {
    return ""
  }

  protected getOriginalBinaryPath() {
    return ""
  }

  public getBinaryDir() {
    return path.dirname(this.getBinaryPath())
  }

  public async binDir() {
    try {
      await this.ensureBinary()
      return this.dirname
    } catch(err) {
      logger.error(err)
      return ""
    }
  }

  protected async checkBinary() {
    const exists = await pathExists(this.getBinaryPath())
    return exists
  }

  public async ensureBinary() {
    const isValid = await this.checkBinary()
    if(!isValid) {
      await this.downloadBinary().catch((error) => { logger.error(error) });
      if (this.tarPath) await this.untarBinary()
      if(this.originalBinaryName != this.binaryName ) await this.renameBinary()
    }
  }

  protected async untarBinary() {
    return new Promise<void>((resolve, reject) => {
      logger.debug(`Extracting ${this.originalBinaryName} binary`)
      tar.x({
        file: this.tarPath,
        cwd: this.dirname
      }).then((_ => {
        resolve()
      }))
    })
  }

  protected async renameBinary() {
    return new Promise<void>((resolve, reject) => {
      logger.debug(`Renaming ${this.originalBinaryName} binary to ${this.binaryName}`)
      fs.rename(this.getOriginalBinaryPath(), this.getBinaryPath(), (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  protected async downloadBinary() {
    const binaryPath = this.tarPath || this.getBinaryPath()
    await ensureDir(this.getBinaryDir(), 0o755)

    const file = fs.createWriteStream(binaryPath)
    const url = this.getUrl()

    logger.info(`Downloading ${this.originalBinaryName} ${this.binaryVersion} from ${url} to ${binaryPath}`)
    const requestOpts: request.UriOptions & request.CoreOptions = {
      uri: url,
      gzip: true
    }

    const stream = request(globalRequestOpts(requestOpts))

    stream.on("complete", () => {
      logger.info(`${this.originalBinaryName} binary download finished`)
      file.end(() => {})
    })

    stream.on("error", (error) => {
      logger.error(error)
      fs.unlink(binaryPath, () => {})
      throw(error)
    })
    return new Promise((resolve, reject) => {
      file.on("close", () => {
        logger.debug(`${this.originalBinaryName} binary download closed`)
        if(!this.tarPath) fs.chmod(binaryPath, 0o755, () => {})
        resolve()
      })
      stream.pipe(file)
    })
  }
}
