/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, getInjectionToken, lifecycleEnum } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";

import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";

import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import type { RegisteredAppPreference } from "./app-preferences/app-preference-registration";

interface ExtensionPreferenceItem extends RegisteredAppPreference {
  extension: LensRendererExtension;
}

export const extensionPreferenceItemInjectionToken = getInjectionToken<ExtensionPreferenceItem>({
  id: "extension-preference-item-injection-token",
});

const extensionsPreferenceItemsInjectable = getInjectable({
  id: "extension-preference-items",

  instantiate: (di, extensionId: string): IComputedValue<RegisteredAppPreference[]> => {
    const extensions = di.inject(rendererExtensionsInjectable);
    const extension = extensions.get().find((extension) => extension.id === extensionId);

    return computed(() => {
      if (!extension) {
        return [];
      }

      return extension.appPreferences
        .filter(preference => !preference.showInPreferencesTab)
        .map(preference => ({
          id: preference.id,
          ...preference,
        }));
    });
  },
  lifecycle: lifecycleEnum.transient,
});

export default extensionsPreferenceItemsInjectable;
