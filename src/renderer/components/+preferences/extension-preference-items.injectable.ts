/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import type { RegisteredAppPreference } from "./app-preferences/app-preference-registration";

export const extensionPreferenceItemInjectionToken = getInjectionToken<RegisteredAppPreference>({
  id: "extension-preference-item-injection-token",
});

const extensionsPreferenceItemsInjectable = getInjectable({
  id: "extension-preference-items",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);

    return computedInjectMany(extensionPreferenceItemInjectionToken);
  },
});

export default extensionsPreferenceItemsInjectable;
