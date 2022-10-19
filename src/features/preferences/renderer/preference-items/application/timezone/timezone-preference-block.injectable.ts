/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../../preference-item-injection-token";
import { Timezone } from "./timezone";

const timezonePreferenceBlockInjectable = getInjectable({
  id: "timezone-preference-item",

  instantiate: () => ({
    kind: "block" as const,
    id: "timezone",
    parentId: "application-page",
    orderNumber: 60,
    Component: Timezone,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default timezonePreferenceBlockInjectable;
