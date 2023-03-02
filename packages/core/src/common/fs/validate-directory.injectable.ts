/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { AsyncResult } from "@k8slens/utilities";
import { isErrnoException } from "@k8slens/utilities";
import type { Stats } from "fs-extra";
import { lowerFirst } from "lodash/fp";
import statInjectable from "./stat.injectable";

export type ValidateDirectory = (path: string) => AsyncResult<undefined>;

function getUserReadableFileType(stats: Stats): string {
  if (stats.isFile()) {
    return "a file";
  }

  if (stats.isFIFO()) {
    return "a pipe";
  }

  if (stats.isSocket()) {
    return "a socket";
  }

  if (stats.isBlockDevice()) {
    return "a block device";
  }

  if (stats.isCharacterDevice()) {
    return "a character device";
  }

  return "an unknown file type";
}

const validateDirectoryInjectable = getInjectable({
  id: "validate-directory",

  instantiate: (di): ValidateDirectory => {
    const stat = di.inject(statInjectable);

    return async (path) => {
      try {
        const stats = await stat(path);

        if (stats.isDirectory()) {
          return { callWasSuccessful: true, response: undefined };
        }

        return { callWasSuccessful: false, error: `the provided path is ${getUserReadableFileType(stats)} and not a directory.` };
      } catch (error) {
        if (!isErrnoException(error)) {
          return { callWasSuccessful: false, error: "of an unknown error, please try again." };
        }

        const humanReadableErrors: Record<string, string> = {
          ENOENT: "the provided path does not exist.",
          EACCES: "search permissions is denied for one of the directories in the prefix of the provided path.",
          ELOOP: "the provided path is a sym-link which points to a chain of sym-links that is too long to resolve. Perhaps it is cyclic.",
          ENAMETOOLONG: "the pathname is too long to be used.",
          ENOTDIR: "a prefix of the provided path is not a directory.",
        };

        const humanReadableError = error.code
          ? humanReadableErrors[error.code]
          : lowerFirst(String(error));

        return { callWasSuccessful: false, error: humanReadableError };
      }
    };
  },
});

export default validateDirectoryInjectable;
