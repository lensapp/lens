import * as path from "path";
import * as fs from "fs";
import * as request from "request";
import logger from "./logger";
import { ensureDir, pathExists } from "fs-extra";
import * as tar from "tar";
const { promises: fsp } = fs;

export interface LensBinaryOpts {
  version: string;
  baseDir: string;
  originalBinaryName: string;
  newBinaryName?: string;
  requestOpts?: request.Options;
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
  protected requestOpts: request.Options

  constructor(opts: LensBinaryOpts) {
    const baseDir = opts.baseDir;
    this.originalBinaryName = opts.originalBinaryName;
    this.binaryName = opts.newBinaryName || opts.originalBinaryName;
    this.binaryVersion = opts.version;
    this.requestOpts = opts.requestOpts;

    let arch = null;

    if(process.arch == "x64") {
      arch = "amd64";
    } else if(process.arch == "x86" || process.arch == "ia32") {
      arch = "386";
    } else {
      arch = process.arch;
    }
    this.arch = arch;
    this.platformName = process.platform === "win32" ? "windows" : process.platform;
    this.dirname = path.normalize(path.join(baseDir, this.binaryName));
    if (process.platform === "win32") {
      this.binaryName = this.binaryName+".exe";
      this.originalBinaryName = this.originalBinaryName+".exe";
    }
    const tarName = this.getTarName();
    if (tarName) {
      this.tarPath = path.join(this.dirname, tarName);
    }
  }

  protected binaryDir(): void {
    throw new Error("binaryDir not implemented");
  }

  public async binaryPath(): Promise<string> {
    await this.ensureBinary();
    return this.getBinaryPath();
  }

  protected getTarName(): string|null {
    return null;
  }

  protected getUrl(): string {
    return "";
  }

  protected getBinaryPath(): string {
    return "";
  }

  protected getOriginalBinaryPath(): string {
    return "";
  }

  public getBinaryDir(): string {
    return path.dirname(this.getBinaryPath());
  }

  public async binDir(): Promise<string> {
    try {
      await this.ensureBinary();
      return this.dirname;
    } catch(err) {
      logger.error(err);
      return "";
    }
  }

  protected async checkBinary(): Promise<boolean> {
    return pathExists(this.getBinaryPath());
  }

  public async ensureBinary(): Promise<void> {
    const isValid = await this.checkBinary();
    if(!isValid) {
      await this.downloadBinary().catch((error) => {
        logger.error(error); 
      });
      if (this.tarPath) {
        await this.untarBinary();
      }
      if(this.originalBinaryName != this.binaryName ) {
        await this.renameBinary();
      }
      logger.info(`${this.originalBinaryName} has been downloaded to ${this.getBinaryPath()}`);
    }
  }

  protected async untarBinary(): Promise<void> {
    logger.debug(`Extracting ${this.originalBinaryName} binary`);
    return tar.x({
      file: this.tarPath,
      cwd: this.dirname
    });
  }

  protected async renameBinary(): Promise<void> {
    logger.debug(`Renaming ${this.originalBinaryName} binary to ${this.binaryName}`);

    return fsp.rename(this.getOriginalBinaryPath(), this.getBinaryPath());
  }

  protected async downloadBinary(): Promise<void> {
    const binaryPath = this.tarPath || this.getBinaryPath();
    await ensureDir(this.getBinaryDir(), 0o755);

    const file = fs.createWriteStream(binaryPath);
    const url = this.getUrl();

    logger.info(`Downloading ${this.originalBinaryName} ${this.binaryVersion} from ${url} to ${binaryPath}`);
    const requestOpts: request.UriOptions & request.CoreOptions = {
      uri: url,
      gzip: true,
      ...this.requestOpts
    };

    const stream = request(requestOpts);

    stream.on("complete", () => {
      logger.info(`Download of ${this.originalBinaryName} finished`);
      file.end(() => {});
    });

    stream.on("error", (error) => {
      logger.error(error);
      fs.unlink(binaryPath, () => {});
      throw(error);
    });
    return new Promise((resolve, _reject) => {
      file.on("close", () => {
        logger.debug(`${this.originalBinaryName} binary download closed`);
        if(!this.tarPath) {
          fs.chmod(binaryPath, 0o755, () => {});
        }
        resolve();
      });
      stream.pipe(file);
    });
  }
}
