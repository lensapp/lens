/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { tmpdir } from "os";

const tempDirectoryPathInjectable = getInjectable({
  id: "temp-directory-path",
  instantiate: () => tmpdir(),
  causesSideEffects: true,
});

export default tempDirectoryPathInjectable;
