/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";

import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";

import type { RegisteredAppPreference } from "./app-preferences/app-preference-registration";

const extensionsPreferenceItemsInjectable = getInjectable({
  id: "extension-preference-items",

  instantiate: (di, pathParams: IComputedValue<Record<string, string>>): IComputedValue<RegisteredAppPreference[]> => {
    const extensions = di.inject(rendererExtensionsInjectable);
    const { extensionId, tabId } = pathParams.get();
    const extension = extensions.get().find((extension) => extension.sanitizedExtensionId === extensionId);

    if (!extension) {
      return computed(() => []);
    }
  
    const preferences = extension.appPreferences.map(preference => ({
      id: preference.id || preference.title,
      ...preference,
    }));

    return computed(() => {
      if (tabId) {
        return preferences.filter(preference => preference.showInPreferencesTab == tabId);
      }

      return preferences.filter(preference => !preference.showInPreferencesTab);
    });
  },
  lifecycle: lifecycleEnum.singleton,
});

export default extensionsPreferenceItemsInjectable;
