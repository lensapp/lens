/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { appSemVer } from "../../../common/vars";
import { isCompatibleExtension } from "./is-compatible-extension";

const isCompatibleExtensionInjectable = getInjectable({
  id: "is-compatible-extension",
  instantiate: () => isCompatibleExtension({ appSemVer }),
});

export default isCompatibleExtensionInjectable;
