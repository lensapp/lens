/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../preference-item-injection-token";
import React from "react";
import { getPreferencePage } from "../../get-preference-page";
import { HorizontalLine } from "../../horizontal-line/horizontal-line";

const proxyPreferencePageInjectable = getInjectable({
  id: "proxy-preference-page",

  instantiate: () => ({
    kind: "page" as const,
    id: "proxy-page",
    parentId: "proxy-tab",
    orderNumber: 0,
    Component: getPreferencePage("Proxy"),
    childrenSeparator: () => <HorizontalLine small />,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default proxyPreferencePageInjectable;
