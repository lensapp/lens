/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { broadcastMessage } from "../ipc";

const broadcastInjectable = getInjectable({
  instantiate: () => broadcastMessage as (channel: string, ...args: any[]) => void,
  lifecycle: lifecycleEnum.singleton,
});

export default broadcastInjectable;
