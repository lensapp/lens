/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { homedir } from "os";

const homeDirectoryPathInjectable = getInjectable({
  id: "home-directory-path",
  instantiate: () => homedir(),
  causesSideEffects: true,
});

export default homeDirectoryPathInjectable;
