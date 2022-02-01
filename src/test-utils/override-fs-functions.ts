/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DependencyInjectionContainer } from "@ogre-tools/injectable";
import readDirInjectable from "../common/fs/read-dir.injectable";
import readFileInjectable from "../common/fs/read-file.injectable";
import readJsonFileInjectable from "../common/fs/read-json-file.injectable";
import removeDirInjectable from "../common/fs/remove-dir.injectable";
import writeJsonFileInjectable from "../common/fs/write-json-file.injectable";

export function overrideFsFunctions(di: DependencyInjectionContainer): void {
  di.override(removeDirInjectable, () => () => {
    throw new Error("Tried to remove a directory from file system without specifying explicit override.");
  });

  di.override(readDirInjectable, () => () => {
    throw new Error("Tried to read contents of a directory from file system without specifying explicit override.");
  });

  di.override(readFileInjectable, () => () => {
    throw new Error("Tried to read a file from file system without specifying explicit override.");
  });

  di.override(writeJsonFileInjectable, () => () => {
    throw new Error("Tried to write JSON file to file system without specifying explicit override.");
  });

  di.override(readJsonFileInjectable, () => () => {
    throw new Error("Tried to read JSON file from file system without specifying explicit override.");
  });
}
