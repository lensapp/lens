/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { LegacyLensExtension, LensExtensionId } from "@k8slens/legacy-extensions";
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

const extensionInstancesInjectable = getInjectable({
  id: "extension-instances",
  instantiate: () => observable.map<LensExtensionId, LegacyLensExtension>(),
});

export default extensionInstancesInjectable;
