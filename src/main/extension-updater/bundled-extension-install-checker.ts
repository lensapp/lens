/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import fs from "fs";
import logger from "../logger";
import type { ExtensionToDownload } from "./bundled-extension-comparer";

export class BundledExtensionInstallChecker {
  constructor(private extension: ExtensionToDownload, private updatesFolder: string) {
  }

  private getExtensionManifest() {
    try {
      const itemsInFolder = fs.readdirSync(this.updatesFolder);

      const directories = itemsInFolder.filter(dirOrFile =>
        fs.lstatSync(`${this.updatesFolder}/${dirOrFile}`).isDirectory(),
      );

      for (const dir of directories) {
        const packageJson = fs.readFileSync(`${this.updatesFolder}/${dir}/package.json`, "utf-8");
        const contents: { name?: string, version?: string } = JSON.parse(packageJson);

        if (contents.name == this.extension.name) {
          return contents;
        }
      }
    } catch (err) {
      logger.error(err);

      return {};
    }

    return {};
  }

  public isUpdateAlredyInstalled() {
    const manifest = this.getExtensionManifest();

    return manifest.version == this.extension.version;
  }
}
