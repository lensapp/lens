/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { fromPairs } from "lodash/fp";
import type { AppPaths, PathName } from "@lensapp/app-paths";
import { pathNames } from "@lensapp/app-paths";

interface Dependencies {
  getAppPath: (name: PathName) => string;
}

export const getAppPaths = ({ getAppPath }: Dependencies) =>
  fromPairs(pathNames.map((name) => [name, getAppPath(name)])) as AppPaths;
