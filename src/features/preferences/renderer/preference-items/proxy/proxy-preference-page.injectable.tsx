/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { PreferenceItemComponent, PreferencePage } from "../preference-item-injection-token";
import { preferenceItemInjectionToken } from "../preference-item-injection-token";
import React from "react";
import { PreferencePageComponent } from "../../preference-page-component";
import { HorizontalLine } from "../../../../../renderer/components/horizontal-line/horizontal-line";

const ProxyPage: PreferenceItemComponent<PreferencePage> = ({ children, item }) => (
  <PreferencePageComponent title="Proxy" id={item.id}>
    {children}
  </PreferencePageComponent>
);

const proxyPreferencePageInjectable = getInjectable({
  id: "proxy-preference-page",

  instantiate: () => ({
    kind: "page" as const,
    id: "proxy-page",
    parentId: "proxy-tab",
    Component: ProxyPage,
    childSeparator: () => <HorizontalLine size="sm" />,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default proxyPreferencePageInjectable;
