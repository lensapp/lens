/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterApplicationIsLoadedInjectionToken } from "../start-main-application/runnable-tokens/after-application-is-loaded-injection-token";
import emitEventInjectable from "../../common/app-event-bus/emit-event.injectable";
import { getCurrentDateTime } from "../../common/utils/date/get-current-date-time";
import appVersionInjectable from "../../common/vars/app-version.injectable";

const emitCurrentVersionToAnalyticsInjectable = getInjectable({
  id: "emit-current-version-to-analytics",

  instantiate: (di) => {
    const emitEvent = di.inject(emitEventInjectable);
    const appVersion = di.inject(appVersionInjectable);

    return {
      run: () => {
        emitEvent({
          name: "app",
          action: "current-version",

          params: {
            version: appVersion,
            currentDateTime: getCurrentDateTime(),
          },
        });
      },
    };
  },

  injectionToken: afterApplicationIsLoadedInjectionToken,
});

export default emitCurrentVersionToAnalyticsInjectable;
