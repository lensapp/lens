/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import type { AppPreferenceRegistration } from "./app-preferences/app-preference-registration";

export const telemetryPreferenceItemInjectionToken = getInjectionToken<AppPreferenceRegistration>({
  id: "telemetry-preference-item-injection-token",
});

const telemetryPreferenceItemsInjectable = getInjectable({
  id: "telemetry-preference-items",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);

    return computedInjectMany(telemetryPreferenceItemInjectionToken);
  },
});

export default telemetryPreferenceItemsInjectable;

