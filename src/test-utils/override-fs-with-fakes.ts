/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import readFileInjectable from "../common/fs/read-file.injectable";
import writeJsonFileInjectable from "../common/fs/write-json-file.injectable";
import readJsonFileInjectable from "../common/fs/read-json-file.injectable";
import pathExistsInjectable from "../common/fs/path-exists.injectable";

export const overrideFsWithFakes = (di: DiContainer) => {
  const state = new Map();

  const readFile = readFileFor(state);

  di.override(readFileInjectable, () => readFile);
  di.override(writeJsonFileInjectable, () => (
    async (filePath, contents) => {
      state.set(filePath, JSON.stringify(contents));
    }
  ));
  di.override(readJsonFileInjectable, () => (
    async (filePath: string) => JSON.parse(await readFile(filePath))
  ));
  di.override(pathExistsInjectable, () => (
    (filePath: string) => Promise.resolve(state.has(filePath))
  ));
};

const readFileFor = (state: Map<string, string>) => (filePath: string) => {
  const fileContent = state.get(filePath);

  if (!fileContent) {
    const existingFilePaths = [...state.keys()].join('", "');

    throw new Error(
      `Tried to access file ${filePath} which does not exist. Existing file paths are: "${existingFilePaths}"`,
    );
  }

  return Promise.resolve(fileContent);
};
