/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import enabledExtensionsStateInjectable from "./state.injectable";

export type IsExtensionEnabled = (id: string) => boolean;

const isExtensionEnabledInjectable = getInjectable({
  id: "is-extension-enabled",
  instantiate: (di): IsExtensionEnabled => {
    const state = di.inject(enabledExtensionsStateInjectable);

    return (id) => (state.get(id)?.enabled ?? false);
  },
});

export default isExtensionEnabledInjectable;
