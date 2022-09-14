/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { InitializableState } from "../initializable-state/create";
import type { PathName } from "./app-path-names";

export type AppPaths = Record<PathName, string>;

export const appPathsInjectionToken = getInjectionToken<InitializableState<AppPaths>>({
  id: "app-paths-token",
});
