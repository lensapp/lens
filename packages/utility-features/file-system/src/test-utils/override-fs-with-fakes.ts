import type { DiContainer } from "@ogre-tools/injectable";
import readFileInjectable from "../read-file/read-file.injectable";
import pathExistsInjectable from "../path-exists/path-exists.injectable";
import deleteFileInjectable from "../delete-file/delete-file.injectable";
import { getSuccess } from "@lensapp/utils";
import writeFileInjectable from "../write-file/write-file.injectable";

export const overrideFsWithFakes = (di: DiContainer, state = new Map()) => {
  const readFile = readFileFor(state);

  di.override(readFileInjectable, () => readFile);

  di.override(writeFileInjectable, () => async (filePath, contents) => {
    state.set(filePath, contents);

    return getSuccess(undefined);
  });

  di.override(
    pathExistsInjectable,
    () => (filePath: string) => Promise.resolve(getSuccess(state.has(filePath)))
  );

  di.override(deleteFileInjectable, () => async (filePath: string) => {
    state.delete(filePath);

    return getSuccess(undefined);
  });
};

const readFileFor = (state: Map<string, string>) => (filePath: string) => {
  const fileContent = state.get(filePath);

  if (!fileContent) {
    const existingFilePaths = [...state.keys()].join('", "');

    const error = new Error(
      `Tried to access file ${filePath} which does not exist. Existing file paths are: "${existingFilePaths}"`
    );

    (error as any).code = "ENOENT";

    throw error;
  }

  return Promise.resolve(getSuccess(fileContent));
};
