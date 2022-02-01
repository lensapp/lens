/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pathNames, PathName, AppPaths } from "../../common/app-paths/app-paths";
import { fromEntries } from "../../renderer/utils";

interface Dependencies {
  getAppPath: (name: PathName) => string
}

export function getAppPaths({ getAppPath }: Dependencies): AppPaths {
  return fromEntries(pathNames.map((name) => [name, getAppPath(name)]));
}
