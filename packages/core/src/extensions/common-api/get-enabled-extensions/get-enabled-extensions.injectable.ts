/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import enabledExtensionsStateInjectable from "../../enabled-extensions-state.injectable";

const enabledExtensionsInjectable = getInjectable({
  id: "enabled-extensions",
  instantiate: (di) => di.inject(enabledExtensionsStateInjectable).enabledExtensions,
});

export default enabledExtensionsInjectable;
