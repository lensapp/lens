/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { beforeApplicationIsLoadingInjectionToken } from "@k8slens/application";
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../common/logger.injectable";
import appNameInjectable from "../../common/vars/app-name.injectable";
import buildVersionInjectable from "../vars/build-version/build-version.injectable";

const logVersionOnStartInjectable = getInjectable({
  id: "log-version-on-start",
  instantiate: (di) => ({
    run: () => {
      const logger = di.inject(loggerInjectable);
      const buildVersion = di.inject(buildVersionInjectable).get();
      const appName = di.inject(appNameInjectable);

      logger.info(`Starting v${buildVersion} of ${appName}...`);
    },
  }),
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default logVersionOnStartInjectable;
