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
