/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import commandOverlayInjectable from "./command-overlay.injectable";

const openCommandDialogInjectable = getInjectable({
  instantiate: (di) => di.inject(commandOverlayInjectable).open,
  lifecycle: lifecycleEnum.singleton,
});

export default openCommandDialogInjectable;
