/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { appEventBus } from "./event-bus";

const appEventBusInjectable = getInjectable({
  instantiate: () => appEventBus,
  lifecycle: lifecycleEnum.singleton,
});

export default appEventBusInjectable;
