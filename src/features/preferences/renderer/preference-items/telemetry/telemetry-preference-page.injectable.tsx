/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { PreferencePageComponent } from "../../preference-page-component";
import type { PreferenceItemComponent, PreferencePage } from "@lensapp/preferences";
import { preferenceItemInjectionToken } from "@lensapp/preferences";

const TelemetryPage: PreferenceItemComponent<PreferencePage> = ({ children, item }) => (
  <PreferencePageComponent title="Telemetry" id={item.id}>
    {children}
  </PreferencePageComponent>
);

const telemetryPreferencePageInjectable = getInjectable({
  id: "telemetry-preference-page",

  instantiate: () => ({
    kind: "page" as const,
    id: "telemetry-page",
    parentId: "telemetry-tab",
    Component: TelemetryPage,
    childSeparator: () => <hr className="small" />,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default telemetryPreferencePageInjectable;
