/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../../preference-item-injection-token";
import { AutomaticErrorReporting } from "./automatic-error-reporting";
import sentryDataSourceNameInjectable from "../../../../../../common/vars/sentry-dsn-url.injectable";

const automaticErrorReportingPreferenceItemInjectable = getInjectable({
  id: "automatic-error-reporting-preference-item",

  instantiate: (di) => {
    const sentryDnsUrl = di.inject(sentryDataSourceNameInjectable);

    return {
      kind: "block" as const,
      id: "automatic-error-reporting",
      parentId: "telemetry-page",
      orderNumber: 20,
      Component: AutomaticErrorReporting,
      isShown: !!sentryDnsUrl,
    };
  },

  injectionToken: preferenceItemInjectionToken,
});

export default automaticErrorReportingPreferenceItemInjectable;
