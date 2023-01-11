/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { SHA256 } from "crypto-js";
import { action, makeObservable, observable } from "mobx";
import type { BaseStoreDependencies } from "../../../common/base-store/base-store";
import { BaseStore } from "../../../common/base-store/base-store";
import type { LensExtensionId } from "../../lens-extension";
import { getOrInsertWithAsync, toJS } from "../../../common/utils";
import type { EnsureDirectory } from "../../../common/fs/ensure-dir.injectable";
import type { JoinPaths } from "../../../common/path/join-paths.injectable";
import type { RandomBytes } from "../../../common/utils/random-bytes.injectable";

interface FSProvisionModel {
  extensions: Record<string, string>; // extension names to paths
}

interface Dependencies extends BaseStoreDependencies {
  readonly directoryForExtensionData: string;
  ensureDirectory: EnsureDirectory;
  joinPaths: JoinPaths;
  randomBytes: RandomBytes;
}

export class FileSystemProvisionerStore extends BaseStore<FSProvisionModel> {
  readonly registeredExtensions = observable.map<LensExtensionId, string>();

  constructor(protected readonly dependencies: Dependencies) {
    super(dependencies, {
      configName: "lens-filesystem-provisioner-store",
      accessPropertiesByDotNotation: false, // To make dots safe in cluster context names
    });

    makeObservable(this);
  }

  /**
   * This function retrieves the saved path to the folder which the extension
   * can saves files to. If the folder is not present then it is created.
   * @param extensionName the name of the extension requesting the path
   * @returns path to the folder that the extension can safely write files to.
   */
  async requestDirectory(extensionName: string): Promise<string> {
    const dirPath = await getOrInsertWithAsync(this.registeredExtensions, extensionName, async () => {
      const salt = (await this.dependencies.randomBytes(32)).toString("hex");
      const hashedName = SHA256(`${extensionName}/${salt}`).toString();

      return this.dependencies.joinPaths(this.dependencies.directoryForExtensionData, hashedName);
    });

    await this.dependencies.ensureDirectory(dirPath);

    return dirPath;
  }

  @action
  protected fromStore({ extensions }: FSProvisionModel = { extensions: {}}): void {
    this.registeredExtensions.merge(extensions);
  }

  toJSON(): FSProvisionModel {
    return toJS({
      extensions: Object.fromEntries(this.registeredExtensions),
    });
  }
}
