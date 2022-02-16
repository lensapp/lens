/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";
import { pipeline } from "@ogre-tools/fp";
import { filter, overSome } from "lodash/fp";
import { computed } from "mobx";
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import type { AppPreferenceRegistration } from "./app-preferences/app-preference-registration";

export interface ExtensionTelemetryPreferenceRegistration extends AppPreferenceRegistration {
  extension?: LensRendererExtension;
}

export const telemetryPreferenceItemInjectionToken = getInjectionToken<ExtensionTelemetryPreferenceRegistration>({
  id: "telemetry-preference-item-injection-token",
});

const telemetryPreferenceItemsInjectable = getInjectable({
  id: "telemetry-preference-items",
  instantiate: (di) => {
    const extensions = di.inject(rendererExtensionsInjectable);

    return computed(() => {
      const enabledExtensions = extensions.get();

      return pipeline(
        di.injectMany(telemetryPreferenceItemInjectionToken),
        filter((item) =>
          overSome([
            isNonExtensionItem,
            isEnabledExtensionItemFor(enabledExtensions),
          ])(item),
        ),
      );
    });
  },
});


const isNonExtensionItem = (item: ExtensionTelemetryPreferenceRegistration) => !item.extension;

const isEnabledExtensionItemFor =
  (enabledExtensions: LensRendererExtension[]) => (item: ExtensionTelemetryPreferenceRegistration) =>
    !!enabledExtensions.find((extension) => extension === item.extension);


export default telemetryPreferenceItemsInjectable;
