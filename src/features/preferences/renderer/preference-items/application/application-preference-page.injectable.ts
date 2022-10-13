/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../preference-item-injection-token";
import { ApplicationPreferencePage } from "./application-preference-page";
import { HorizontalLine } from "../../../../../renderer/components/+preferences/horizontal-line/horizontal-line";

const applicationPreferencePageInjectable = getInjectable({
  id: "application-preference-page",

  instantiate: () => ({
    kind: "page" as const,
    id: "application-page",
    parentId: "application-tab",
    orderNumber: 0,
    Component: ApplicationPreferencePage,
    childrenSeparator: HorizontalLine,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default applicationPreferencePageInjectable;
