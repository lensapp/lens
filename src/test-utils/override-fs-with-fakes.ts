/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import readFileInjectable from "../common/fs/read-file.injectable";
import writeJsonFileInjectable from "../common/fs/write-json-file.injectable";
import readJsonFileInjectable from "../common/fs/read-json-file.injectable";
import pathExistsInjectable from "../common/fs/path-exists.injectable";

type Override = (di: DiContainer) => void;

export const overrideFsWithFakes = (di: DiContainer) => {
  const state = new Map();

  const readFile = readFileFor(state);

  const overrides: Override[] = [
    (di) => {
      di.override(readFileInjectable, () => readFile);
    },

    (di) => {
      di.override(
        writeJsonFileInjectable,
        () => (filePath, contents) => {
          state.set(filePath, JSON.stringify(contents));

          return Promise.resolve();
        },
      );
    },

    (di) => {
      di.override(readJsonFileInjectable, () => async (filePath: string) => {
        const fileContent = await readFile(filePath);

        return JSON.parse(fileContent.toString());
      });
    },

    (di) => {
      di.override(
        pathExistsInjectable,
        () => async (filePath: string) => Promise.resolve(state.has(filePath)),
      );
    },
  ];

  overrides.forEach(callback => callback(di));
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
