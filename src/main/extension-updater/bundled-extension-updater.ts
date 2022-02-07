/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import fs from "fs";
import { ensureDir } from "fs-extra";
import request from "request";
import logger from "../logger";
import path from "path";
import { noop } from "../../common/utils";

type Extension = {
  name: string
  version: string
  downloadUrl: string
};

export class BundledExtensionUpdater {
  private extension: Extension;
  private updateFolderPath: string;

  constructor(extension: Extension, updateFolderPath: string) {
    this.extension = extension;
    this.updateFolderPath = updateFolderPath;
  }

  public async update() {
    await this.download();
  }

  private get filePath() {
    return `${this.updateFolderPath}/${this.extension.name}-${this.extension.version}.tgz`;
  }

  private async download() {
    const { downloadUrl, name } = this.extension;

    await ensureDir(path.dirname(this.updateFolderPath), 0o755);

    const file = fs.createWriteStream(this.filePath);

    logger.info(`[EXTENSION-UPDATER]: Downloading extension ${name} from ${downloadUrl} to ${this.filePath}`);
    const requestOpts: request.UriOptions & request.CoreOptions = {
      uri: downloadUrl,
      gzip: true,
    };
    const stream = request.get(requestOpts);

    stream.on("complete", () => {
      logger.info(`[EXTENSION-UPDATER]: Download extension ${name} tgz file completed`);
      file.end(noop);
    });

    stream.on("error", (error) => {
      logger.error(error);
      fs.unlink(this.filePath, noop);
      throw error;
    });

    return new Promise<void>((resolve, reject) => {
      file.on("close", () => {
        logger.info(`[EXTENSION-UPDATER]: Download extension ${name} tgz file closed`);
        fs.chmod(downloadUrl, 0o755, (err) => {
          if (err) reject(err);
        });
        resolve();
      });
      stream.pipe(file);
    });
  }
}
