/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../preference-item-injection-token";
import { TelemetryPage } from "./telemetry-page";
import { HorizontalLine } from "../../../../../renderer/components/+preferences/horizontal-line/horizontal-line";

const telemetryPreferencePageInjectable = getInjectable({
  id: "telemetry-preference-page",

  instantiate: () => ({
    kind: "page" as const,
    id: "telemetry-page",
    parentId: "telemetry-tab",
    orderNumber: 0,
    Component: TelemetryPage,
    childrenSeparator: HorizontalLine,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default telemetryPreferencePageInjectable;
