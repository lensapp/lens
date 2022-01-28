/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import themeStoreInjectable from "./store.injectable";

const terminalColorsInjectable = getInjectable({
  instantiate: (di) => di.inject(themeStoreInjectable).xtermColors,
  lifecycle: lifecycleEnum.singleton,
});

export default terminalColorsInjectable;
