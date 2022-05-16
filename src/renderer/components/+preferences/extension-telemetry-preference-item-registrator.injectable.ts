/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { filter, map } from "lodash/fp";
import { extensionRegistratorInjectionToken } from "../../../extensions/extension-loader/extension-registrator-injection-token";
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import { pipeline } from "@ogre-tools/fp";
import { telemetryPreferenceItemInjectionToken } from "./telemetry-preference-items.injectable";

const extensionTelemetryPreferenceItemRegistratorInjectable = getInjectable({
  id: "extension-telemetry-preference-item-registrator",

  instantiate:
    (di) =>
      (ext, extensionInstallationCount) => {
        const extension = ext as LensRendererExtension;
        const injectables = pipeline(
          extension.appPreferences,

          filter(
            (registration) => registration.showInPreferencesTab === "telemetry",
          ),

          map((registration) => {
            const id = `telemetry-preferences-item-${registration.id}-for-extension-${extension.sanitizedExtensionId}`;

            return getInjectable({
              id: `${id}-for-instance-${extensionInstallationCount}`,
              injectionToken: telemetryPreferenceItemInjectionToken,

              instantiate: () => ({
                id: registration.id || id,
                title: registration.title,
                extension,

                components: {
                  Hint: registration.components.Hint,
                  Input: registration.components.Input,
                },
              }),
            });
          }),
        );

        injectables.forEach(di.register);

        return;
      },

  injectionToken: extensionRegistratorInjectionToken,
});

export default extensionTelemetryPreferenceItemRegistratorInjectable;
