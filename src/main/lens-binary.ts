import path from "path";
import fs from "fs";
import fse from "fs-extra";
import * as tar from "tar";
import { isWindows } from "../common/vars";
import winston from "winston";
import { GotStreamFunctionOptions } from "../common/got-opts";
import got from "got";
import stream from "stream";
import { promisify } from "util";

const pipeline = promisify(stream.pipeline);

export type LensBinaryOpts = {
  version: string;
  baseDir: string;
  originalBinaryName: string;
  newBinaryName?: string;
  requestOpts?: GotStreamFunctionOptions;
};

export class LensBinary {

  public binaryVersion: string;
  protected directory: string;
  protected url: string;
  protected path: string;
  protected tarPath: string;
  protected dirname: string;
  protected binaryName: string;
  protected platformName: string;
  protected arch: string;
  protected originalBinaryName: string;
  protected requestOpts: GotStreamFunctionOptions;
  protected logger: Console | winston.Logger;

  constructor(opts: LensBinaryOpts) {
    const baseDir = opts.baseDir;

    this.originalBinaryName = opts.originalBinaryName;
    this.binaryName = opts.newBinaryName || opts.originalBinaryName;
    this.binaryVersion = opts.version;
    this.requestOpts = opts.requestOpts;
    this.logger = console;
    let arch = null;

    if (process.arch == "x64") {
      arch = "amd64";
    }
    else if (process.arch == "x86" || process.arch == "ia32") {
      arch = "386";
    }
    else {
      arch = process.arch;
    }
    this.arch = arch;
    this.platformName = isWindows ? "windows" : process.platform;
    this.dirname = path.normalize(path.join(baseDir, this.binaryName));

    if (isWindows) {
      this.binaryName = `${this.binaryName}.exe`;
      this.originalBinaryName = `${this.originalBinaryName}.exe`;
    }
    const tarName = this.getTarName();

    if (tarName) {
      this.tarPath = path.join(this.dirname, tarName);
    }
  }

  public setLogger(logger: Console | winston.Logger) {
    this.logger = logger;
  }

  protected binaryDir() {
    throw new Error("binaryDir not implemented");
  }

  public async binaryPath() {
    await this.ensureBinary();

    return this.getBinaryPath();
  }

  protected getTarName(): string | null {
    return null;
  }

  protected getUrl() {
    return "";
  }

  protected getBinaryPath() {
    return "";
  }

  protected getOriginalBinaryPath() {
    return "";
  }

  public getBinaryDir() {
    return path.dirname(this.getBinaryPath());
  }

  public async binDir() {
    try {
      await this.ensureBinary();

      return this.dirname;
    } catch (err) {
      this.logger.error(err);

      return "";
    }
  }

  protected async checkBinary() {
    return fse.pathExists(this.getBinaryPath());
  }

  public async ensureBinary() {
    try {
      if (await this.checkBinary()) {
        return;
      }

      await this.downloadBinary();

      if (this.tarPath) {
        await this.untarBinary();
      }

      if (this.originalBinaryName !== this.binaryName) {
        await this.renameBinary();
      }

      this.logger.info(`${this.originalBinaryName} has been downloaded to ${this.getBinaryPath()}`);
    } catch (err) {
      this.logger.error(err);
    }
  }

  protected async untarBinary() {
    this.logger.debug(`Extracting ${this.originalBinaryName} binary`);

    try {
      await tar.x({
        file: this.tarPath,
        cwd: this.dirname
      });
    } catch (err) {
      this.logger.error(`failed to extract ${this.originalBinaryName}: `, err);
    }
  }

  protected async renameBinary() {
    this.logger.debug(`Renaming ${this.originalBinaryName} binary to ${this.binaryName}`);

    return fse.promises.rename(this.getOriginalBinaryPath(), this.getBinaryPath());
  }

  protected async downloadBinary() {
    const binaryPath = this.tarPath || this.getBinaryPath();

    await fse.ensureDir(this.getBinaryDir(), 0o755);

    const url = this.getUrl();
    const requestOpts: GotStreamFunctionOptions = {
      decompress: true,
      isStream: true,
      ...this.requestOpts
    };

    this.logger.info(`Downloading ${this.originalBinaryName} ${this.binaryVersion} from ${url} to ${binaryPath}`);

    try {
      await pipeline(
        got.stream(url, requestOpts),
        fs.createWriteStream(binaryPath),
      );
    } catch (err) {
      this.logger.error("Failed to download kubectl:", err);
    }
  }
}
