/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import enabledExtensionsStateInjectable from "../../enabled-extensions-state.injectable";

const updateExtensionsStateInjectable = getInjectable({
  id: "update-extensions-state",
  instantiate: (di) => di.inject(enabledExtensionsStateInjectable).mergeState,
});

export default updateExtensionsStateInjectable;
