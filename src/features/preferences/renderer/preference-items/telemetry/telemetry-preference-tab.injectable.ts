/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../preference-item-injection-token";
import sentryDataSourceNameInjectable from "../../../../../common/vars/sentry-dsn-url.injectable";

const telemetryPreferenceTabInjectable = getInjectable({
  id: "telemetry-preference-tab",

  instantiate: (di) => {
    const sentryDnsUrl = di.inject(sentryDataSourceNameInjectable);

    return {
      kind: "tab" as const,
      id: "telemetry-tab",
      parentId: "general-tab-group" as const,
      pathId: "telemetry",
      testId: "terminal-preferences-page",
      label: "Telemetry",
      orderNumber: 60,
      isShown: !!sentryDnsUrl,
    };
  },

  injectionToken: preferenceItemInjectionToken,
});

export default telemetryPreferenceTabInjectable;
