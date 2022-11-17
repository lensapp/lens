/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import execFileInjectable from "../../../../common/fs/exec-file.injectable";
import loggerInjectable from "../../../../common/logger.injectable";
import { defaultExtensionRegistryUrl } from "../../../../common/user-store/preferences-helpers";
import userStoreInjectable from "../../../../common/user-store/user-store.injectable";
import showErrorNotificationInjectable from "../../notifications/show-error-notification.injectable";

const getBaseRegistryUrlInjectable = getInjectable({
  id: "get-base-registry-url",

  instantiate: (di) => {
    const { extensionRegistryUrl } = di.inject(userStoreInjectable);
    const showErrorNotification = di.inject(showErrorNotificationInjectable);
    const logger = di.inject(loggerInjectable);
    const execFile = di.inject(execFileInjectable);

    return async () => {
      switch (extensionRegistryUrl.location) {
        case "custom":
          return extensionRegistryUrl.customUrl;

        case "npmrc": {
          const filteredEnv = Object.fromEntries(
            Object.entries(process.env)
              .filter(([key]) => !key.startsWith("npm")),
          );
          const result = await execFile("npm", ["config", "get", "registry"], { env: filteredEnv });

          if (result.callWasSuccessful) {
            return result.response.trim();
          }

          showErrorNotification((
            <p>
              Failed to get configured registry from
              <code>.npmrc</code>
              . Falling back to default registry.
            </p>
          ));
          logger.warn("[EXTENSIONS]: failed to get configured registry from .npmrc", result.error);
        }

        // fallthrough
        default:
        case "default":
          return defaultExtensionRegistryUrl;
      }
    };
  },
});

export default getBaseRegistryUrlInjectable;
