/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { randomBytes } from "crypto";
import { SHA256 } from "crypto-js";
import { app, remote } from "electron";
import fse from "fs-extra";
import { action, makeObservable, observable } from "mobx";
import path from "path";
import { BaseStore } from "../common/base-store";
import type { LensExtensionId } from "../extensions/lens-extension";
import { toJS } from "../common/utils";

interface FSProvisionModel {
  extensions: Record<string, string>; // extension names to paths
}

export class FilesystemProvisionerStore extends BaseStore<FSProvisionModel> {
  registeredExtensions = observable.map<LensExtensionId, string>();

  constructor() {
    super({
      configName: "lens-filesystem-provisioner-store",
      accessPropertiesByDotNotation: false, // To make dots safe in cluster context names
    });
    makeObservable(this);
    this.load();
  }

  /**
   * This function retrieves the saved path to the folder which the extension
   * can saves files to. If the folder is not present then it is created.
   * @param extensionName the name of the extension requesting the path
   * @returns path to the folder that the extension can safely write files to.
   */
  async requestDirectory(extensionName: string): Promise<string> {
    if (!this.registeredExtensions.has(extensionName)) {
      const salt = randomBytes(32).toString("hex");
      const hashedName = SHA256(`${extensionName}/${salt}`).toString();
      const dirPath = path.resolve((app || remote.app).getPath("userData"), "extension_data", hashedName);

      this.registeredExtensions.set(extensionName, dirPath);
    }

    const dirPath = this.registeredExtensions.get(extensionName);

    await fse.ensureDir(dirPath);

    return dirPath;
  }

  @action
  protected fromStore({ extensions }: FSProvisionModel = { extensions: {} }): void {
    this.registeredExtensions.merge(extensions);
  }

  toJSON(): FSProvisionModel {
    return toJS({
      extensions: Object.fromEntries(this.registeredExtensions),
    });
  }
}
