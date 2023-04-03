/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import enabledExtensionsStateInjectable from "./state.injectable";

export interface IsEnabledExtensionDescriptor {
  readonly id: string;
  readonly isBundled: boolean;
}

export type IsExtensionEnabled = (desc: IsEnabledExtensionDescriptor) => boolean;

const isExtensionEnabledInjectable = getInjectable({
  id: "is-extension-enabled",
  instantiate: (di): IsExtensionEnabled => {
    const state = di.inject(enabledExtensionsStateInjectable);

    return ({ id, isBundled }) => isBundled || (state.get(id)?.enabled ?? false);
  },
});

export default isExtensionEnabledInjectable;
