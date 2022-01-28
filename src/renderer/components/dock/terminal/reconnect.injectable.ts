/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import terminalStoreInjectable from "./store.injectable";

const reconnectTerminalInjectable = getInjectable({
  instantiate: (di) => di.inject(terminalStoreInjectable).reconnect,
  lifecycle: lifecycleEnum.singleton,
});

export default reconnectTerminalInjectable;
