/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { webContents } from "electron";

const webContentsInjectable = getInjectable({
  id: "web-contents",
  instantiate: () => webContents,
  causesSideEffects: true,
});

export default webContentsInjectable;
