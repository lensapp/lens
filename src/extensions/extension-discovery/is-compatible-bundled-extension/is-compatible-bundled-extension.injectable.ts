/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { appSemVer } from "../../../common/vars";
import { isCompatibleBundledExtension } from "./is-compatible-bundled-extension";

const isCompatibleBundledExtensionInjectable = getInjectable({
  instantiate: () => isCompatibleBundledExtension({ appSemVer }),
  lifecycle: lifecycleEnum.singleton,
});

export default isCompatibleBundledExtensionInjectable;
