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

  instantiate: (di, pathParams: IComputedValue<Record<string, string>>): IComputedValue<RegisteredAppPreference[]> => {
    const extensions = di.inject(rendererExtensionsInjectable);
    const { extensionId, tabId } = pathParams.get();
    const extension = extensions.get().find((extension) => extension.sanitizedExtensionId === extensionId);
    const preferences = extension.appPreferences.map(preference => ({
      id: preference.id,
      ...preference,
    }));

    return computed(() => {
      if (!extension) {
        return [];
      }

      if (tabId) {
        return preferences.filter(preference => preference.showInPreferencesTab == tabId);
      }

      return preferences.filter(preference => !preference.showInPreferencesTab);
    });
  },
  lifecycle: lifecycleEnum.transient,
});

export default extensionsPreferenceItemsInjectable;
