/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { appSemVer } from "../../../common/vars";
import { isCompatibleBundledExtension } from "./is-compatible-bundled-extension";

const isCompatibleBundledExtensionInjectable = getInjectable({
  id: "is-compatible-bundled-extension",
  instantiate: () => isCompatibleBundledExtension({ appSemVer }),
});

export default isCompatibleBundledExtensionInjectable;
