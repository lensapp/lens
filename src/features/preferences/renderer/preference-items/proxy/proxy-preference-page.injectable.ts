/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../preference-item-injection-token";
import { ProxyPreferencePage } from "./proxy-preference-page";
import { HorizontalLine } from "../../../../../renderer/components/+preferences/horizontal-line/horizontal-line";

const proxyPreferencePageInjectable = getInjectable({
  id: "proxy-preference-page",

  instantiate: () => ({
    kind: "page" as const,
    id: "proxy-page",
    parentId: "proxy-tab",
    orderNumber: 0,
    Component: ProxyPreferencePage,
    childrenSeparator: HorizontalLine,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default proxyPreferencePageInjectable;
