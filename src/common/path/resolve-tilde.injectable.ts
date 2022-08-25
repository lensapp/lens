/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import homeDirectoryPathInjectable from "../os/home-directory-path.injectable";
import fileSystemSeparatorInjectable from "./separator.injectable";

export type ResolveTilde = (path: string) => string;

const resolveTildeInjectable = getInjectable({
  id: "resolve-tilde",
  instantiate: (di): ResolveTilde => {
    const homeDirectoryPath = di.inject(homeDirectoryPathInjectable);
    const fileSystemSeparator = di.inject(fileSystemSeparatorInjectable);

    return (filePath) => {
      if (filePath === "~") {
        return homeDirectoryPath;
      }

      if (filePath === `~${fileSystemSeparator}`) {
        return `${homeDirectoryPath}${filePath.slice(1)}`;
      }

      return filePath;
    };
  },
});

export default resolveTildeInjectable;
