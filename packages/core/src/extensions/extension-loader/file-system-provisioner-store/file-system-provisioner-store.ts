/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, makeObservable, observable } from "mobx";
import type { BaseStoreDependencies } from "../../../common/base-store/base-store";
import { BaseStore } from "../../../common/base-store/base-store";
import type { LensExtensionId } from "../../lens-extension";
import { toJS } from "../../../common/utils";
import type { EnsureHashedDirectoryForExtension } from "./ensure-hashed-directory-for-extension.injectable";

interface FSProvisionModel {
  extensions: Record<string, string>; // extension names to paths
}

interface Dependencies extends BaseStoreDependencies {
  ensureHashedDirectoryForExtension: EnsureHashedDirectoryForExtension;
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
    return this.dependencies.ensureHashedDirectoryForExtension(extensionName, this.registeredExtensions);
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
