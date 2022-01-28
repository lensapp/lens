/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import fs from "fs";
import request from "request";
import { ensureDir, pathExists } from "fs-extra";
import * as tar from "tar";
import { isWindows } from "../common/vars";
import type winston from "winston";

export type LensBinaryOpts = {
  version: string;
  baseDir: string;
  originalBinaryName: string;
  newBinaryName?: string;
  requestOpts?: request.Options;
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
  protected requestOpts: request.Options;
  protected logger: Console | winston.Logger;

  constructor(opts: LensBinaryOpts) {
    const baseDir = opts.baseDir;

    this.originalBinaryName = opts.originalBinaryName;
    this.binaryName = opts.newBinaryName || opts.originalBinaryName;
    this.binaryVersion = opts.version;
    this.requestOpts = opts.requestOpts;
    this.logger = console;
    let arch = null;

    if (process.env.BINARY_ARCH) {
      arch = process.env.BINARY_ARCH;
    } else if (process.arch == "x64") {
      arch = "amd64";
    } else if (process.arch == "x86" || process.arch == "ia32") {
      arch = "386";
    } else {
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
    const exists = await pathExists(this.getBinaryPath());

    return exists;
  }

  public async ensureBinary() {
    const isValid = await this.checkBinary();

    if (!isValid) {
      await this.downloadBinary().catch((error) => {
        this.logger.error(error);
      });
      if (this.tarPath) await this.untarBinary();
      if (this.originalBinaryName != this.binaryName) await this.renameBinary();
      this.logger.info(`${this.originalBinaryName} has been downloaded to ${this.getBinaryPath()}`);
    }
  }

  protected untarBinary() {
    return new Promise<void>(resolve => {
      this.logger.debug(`Extracting ${this.originalBinaryName} binary`);
      tar.x({
        file: this.tarPath,
        cwd: this.dirname,
      }).then((() => {
        resolve();
      }));
    });
  }

  protected renameBinary() {
    return new Promise<void>((resolve, reject) => {
      this.logger.debug(`Renaming ${this.originalBinaryName} binary to ${this.binaryName}`);
      fs.rename(this.getOriginalBinaryPath(), this.getBinaryPath(), (err) => {
        if (err) {
          reject(err);
        }
        else {
          resolve();
        }
      });
    });
  }

  protected async downloadBinary() {
    const binaryPath = this.tarPath || this.getBinaryPath();

    await ensureDir(this.getBinaryDir(), 0o755);

    const file = fs.createWriteStream(binaryPath);
    const url = this.getUrl();

    this.logger.info(`Downloading ${this.originalBinaryName} ${this.binaryVersion} from ${url} to ${binaryPath}`);
    const requestOpts: request.UriOptions & request.CoreOptions = {
      uri: url,
      gzip: true,
      ...this.requestOpts,
    };
    const stream = request(requestOpts);

    stream.on("complete", () => {
      this.logger.info(`Download of ${this.originalBinaryName} finished`);
      file.end();
    });

    stream.on("error", (error) => {
      this.logger.error(error);
      fs.unlink(binaryPath, () => {
        // do nothing
      });
      throw(error);
    });

    return new Promise<void>((resolve, reject) => {
      file.on("close", () => {
        this.logger.debug(`${this.originalBinaryName} binary download closed`);
        if (!this.tarPath) fs.chmod(binaryPath, 0o755, (err) => {
          if (err) reject(err);
        });
        resolve();
      });
      stream.pipe(file);
    });
  }
}
