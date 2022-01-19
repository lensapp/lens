/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { appSemVer } from "../../../common/vars";
import { isCompatibleExtension } from "./is-compatible-extension";

const isCompatibleExtensionInjectable = getInjectable({
  instantiate: () => isCompatibleExtension({ appSemVer }),
  lifecycle: lifecycleEnum.singleton,
});

export default isCompatibleExtensionInjectable;
