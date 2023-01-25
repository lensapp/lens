/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import appPathsInjectable from "./app-paths.injectable";

const directoryForLogsInjectable = getInjectable({
  id: "directory-for-logs",
  instantiate: (di) => di.inject(appPathsInjectable).logs,
});

export default directoryForLogsInjectable;
