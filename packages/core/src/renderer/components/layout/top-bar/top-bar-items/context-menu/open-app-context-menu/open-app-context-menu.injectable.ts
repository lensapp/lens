/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { emitOpenAppMenuAsContextMenu } from "../../../../../../ipc";

const openAppContextMenuInjectable = getInjectable({
  id: "open-app-context-menu",
  instantiate: () => emitOpenAppMenuAsContextMenu,
  causesSideEffects: true,
});

export default openAppContextMenuInjectable;
