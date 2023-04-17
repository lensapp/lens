/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterApplicationIsLoadedInjectionToken } from "@k8slens/application";
import emitAppEventInjectable from "../../../common/app-event-bus/emit-event.injectable";
import { getCurrentDateTime } from "../../../common/utils/date/get-current-date-time";
import { buildVersionInitializable } from "../../vars/build-version/common/token";

const emitCurrentVersionToAnalyticsInjectable = getInjectable({
  id: "emit-current-version-to-analytics",

  instantiate: (di) => ({
    run: () => {
      const emitAppEvent = di.inject(emitAppEventInjectable);
      const buildVersion = di.inject(buildVersionInitializable.stateToken);

      emitAppEvent({
        name: "app",
        action: "current-version",

        params: {
          version: buildVersion,
          currentDateTime: getCurrentDateTime(),
        },
      });
    },
  }),

  injectionToken: afterApplicationIsLoadedInjectionToken,
});

export default emitCurrentVersionToAnalyticsInjectable;
