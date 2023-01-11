/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../preference-item-injection-token";

const telemetryPreferenceTabInjectable = getInjectable({
  id: "telemetry-preference-tab",

  instantiate: () => ({
    kind: "tab" as const,
    id: "telemetry-tab",
    parentId: "general-tab-group" as const,
    pathId: "telemetry",
    label: "Telemetry",
    orderNumber: 60,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default telemetryPreferenceTabInjectable;
