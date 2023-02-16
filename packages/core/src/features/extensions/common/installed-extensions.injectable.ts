/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { InstalledExtension } from "../../../extensions/common-api";
import type { LensExtensionId } from "../../../extensions/lens-extension";

const installedExtensionsInjectable = getInjectable({
  id: "installed-extensions",
  instantiate: () => observable.map<LensExtensionId, InstalledExtension>(),
});

export default installedExtensionsInjectable;
