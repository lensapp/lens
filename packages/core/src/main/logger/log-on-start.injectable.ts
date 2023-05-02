/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { beforeApplicationIsLoadingInjectionToken } from "@k8slens/application";
import { getInjectable } from "@ogre-tools/injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import appNameInjectable from "../../common/vars/app-name.injectable";
import { buildVersionInitializable } from "../../features/vars/build-version/common/token";
import { buildVersionInitializationInjectable } from "../../features/vars/build-version/main/init.injectable";

const logVersionOnStartInjectable = getInjectable({
  id: "log-version-on-start",
  instantiate: (di) => ({
    run: () => {
      const logger = di.inject(loggerInjectionToken);
      const buildVersion = di.inject(buildVersionInitializable.stateToken);
      const appName = di.inject(appNameInjectable);

      logger.info(`Starting v${buildVersion} of ${appName}...`);
    },
    runAfter: buildVersionInitializationInjectable,
  }),
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default logVersionOnStartInjectable;
