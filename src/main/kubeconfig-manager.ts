import { app } from "electron"
import * as fs from "fs"
import { ensureDir, randomFileName} from "./file-helpers"
import logger from "./logger"

export class KubeconfigManager {
  protected configDir = app.getPath("temp")
  protected kubeconfig: string
  protected tempFile: string

  constructor(kubeconfig: string) {
    this.kubeconfig = kubeconfig
    this.tempFile = this.createTemporaryKubeconfig()
  }

  public getPath() {
    return this.tempFile
  }

  protected createTemporaryKubeconfig(): string {
    ensureDir(this.configDir)
    const path = `${this.configDir}/${randomFileName("kubeconfig")}`
    logger.debug('Creating temporary kubeconfig: ' + path)
    fs.writeFileSync(path, this.kubeconfig)
    return path
  }

  public unlink() {
    logger.debug('Deleting temporary kubeconfig: ' + this.tempFile)
    fs.unlinkSync(this.tempFile)
  }
}
