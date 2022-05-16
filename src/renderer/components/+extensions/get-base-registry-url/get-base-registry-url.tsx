/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { ExtensionRegistry } from "../../../../common/user-store/preferences-helpers";
import { defaultExtensionRegistryUrl } from "../../../../common/user-store/preferences-helpers";
import { promiseExecFile } from "../../../utils";
import { Notifications } from "../../notifications";

interface Dependencies {
  getRegistryUrlPreference: () => ExtensionRegistry;
}

export const getBaseRegistryUrl = ({ getRegistryUrlPreference }: Dependencies) => async () => {
  const extensionRegistryUrl = getRegistryUrlPreference();

  switch (extensionRegistryUrl.location) {
    case "custom":
      return extensionRegistryUrl.customUrl;

    case "npmrc": {
      try {
        const filteredEnv = Object.fromEntries(
          Object.entries(process.env)
            .filter(([key]) => !key.startsWith("npm")),
        );
        const { stdout } = await promiseExecFile("npm", ["config", "get", "registry"], { env: filteredEnv });

        return stdout.trim();
      } catch (error) {
        Notifications.error((
          <p>
            Failed to get configured registry from
            <code>.npmrc</code>
            . Falling back to default registry.
          </p>
        ));
        console.warn("[EXTENSIONS]: failed to get configured registry from .npmrc", error);
      }
    }

    // fallthrough
    default:
    case "default":
      return defaultExtensionRegistryUrl;
  }
};
