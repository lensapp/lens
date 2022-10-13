/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../../preference-item-injection-token";
import { StartUp } from "./start-up";

const startUpPreferenceItemInjectable = getInjectable({
  id: "start-up-preference-item",

  instantiate: () => ({
    kind: "item" as const,
    id: "start-up",
    parentId: "application-page",
    orderNumber: 30,
    Component: StartUp,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default startUpPreferenceItemInjectable;
