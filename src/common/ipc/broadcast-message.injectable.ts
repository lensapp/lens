/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { broadcastMessage } from "./ipc";

const broadcastMessageInjectable = getInjectable({
  id: "broadcast-message",
  instantiate: () => broadcastMessage,
  causesSideEffects: true,
});

export default broadcastMessageInjectable;
