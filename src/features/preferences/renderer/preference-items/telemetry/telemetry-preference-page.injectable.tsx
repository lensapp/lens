/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../preference-item-injection-token";
import { TelemetryPage } from "./telemetry-page";
import React from "react";
import sentryDataSourceNameInjectable from "../../../../../common/vars/sentry-dsn-url.injectable";

const telemetryPreferencePageInjectable = getInjectable({
  id: "telemetry-preference-page",

  instantiate: (di) => {
    const sentryDnsUrl = di.inject(sentryDataSourceNameInjectable);

    return {
      kind: "page" as const,
      id: "telemetry-page",
      parentId: "telemetry-tab",
      orderNumber: 0,
      Component: TelemetryPage,
      childrenSeparator: () => <hr className="small" />,
      isShown: !!sentryDnsUrl,
    };
  },

  injectionToken: preferenceItemInjectionToken,
});

export default telemetryPreferencePageInjectable;
