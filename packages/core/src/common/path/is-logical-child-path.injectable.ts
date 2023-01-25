/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getAbsolutePathInjectable from "./get-absolute-path.injectable";
import getDirnameOfPathInjectable from "./get-dirname.injectable";

/**
 * Checks if `testPath` represents a potential filesystem entry that would be
 * logically "within" the `parentPath` directory.
 *
 * This function will return `true` in the above case, and `false` otherwise.
 * It will return `false` if the two paths are the same (after resolving them).
 *
 * The function makes no FS calls and is platform dependant. Meaning that the
 * results are only guaranteed to be correct for the platform you are running
 * on.
 * @param parentPath The known path of a directory
 * @param testPath The path that is to be tested
 */
export type IsLogicalChildPath = (parentPath: string, testPath: string) => boolean;

const isLogicalChildPathInjectable = getInjectable({
  id: "is-logical-child-path",
  instantiate: (di): IsLogicalChildPath => {
    const getAbsolutePath = di.inject(getAbsolutePathInjectable);
    const getDirnameOfPath = di.inject(getDirnameOfPathInjectable);

    return (parentPath, testPath) => {
      const resolvedParentPath = getAbsolutePath(parentPath);
      let resolvedTestPath = getAbsolutePath(testPath);

      if (resolvedParentPath === resolvedTestPath) {
        return false;
      }

      while (resolvedTestPath.length >= resolvedParentPath.length) {
        if (resolvedTestPath === resolvedParentPath) {
          return true;
        }

        resolvedTestPath = getDirnameOfPath(resolvedTestPath);
      }

      return false;
    };
  },
});

export default isLogicalChildPathInjectable;
