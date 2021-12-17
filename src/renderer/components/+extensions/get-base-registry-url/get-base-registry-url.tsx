/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from "react";
import { defaultExtensionRegistryUrl, ExtensionRegistry, ExtensionRegistryLocation } from "../../../../common/user-store/preferences-helpers";
import { promiseExecFile } from "../../../utils";
import { Notifications } from "../../notifications";

export interface Dependencies {
  getRegistryUrlPreference: () => ExtensionRegistry,
}

export const getBaseRegistryUrl = ({ getRegistryUrlPreference }: Dependencies) => async () => {
  const extensionRegistryUrl = getRegistryUrlPreference();

  switch (extensionRegistryUrl.location) {
    case ExtensionRegistryLocation.CUSTOM:
      return extensionRegistryUrl.customUrl;

    case ExtensionRegistryLocation.NPMRC: {
      try {
        const filteredEnv = Object.fromEntries(
          Object.entries(process.env)
            .filter(([key]) => !key.startsWith("npm")),
        );
        const { stdout } = await promiseExecFile("npm", ["config", "get", "registry"], { env: filteredEnv });

        return stdout.trim();
      } catch (error) {
        Notifications.error(<p>Failed to get configured registry from <code>.npmrc</code>. Falling back to default registry</p>);
        console.warn("[EXTENSIONS]: failed to get configured registry from .npmrc", error);
        // fallthrough
      }
    }
    default:
    case ExtensionRegistryLocation.DEFAULT:
      return defaultExtensionRegistryUrl;
  }
};
