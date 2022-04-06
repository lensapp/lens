/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import type { AppPreferenceRegistration, RegisteredAppPreference } from "./app-preference-registration";

interface Dependencies {
  extensions: IComputedValue<LensRendererExtension[]>;
}

function getRegisteredItem(item: AppPreferenceRegistration): RegisteredAppPreference {
  return {
    id: item.id || item.title.toLowerCase().replace(/[^0-9a-zA-Z]+/g, "-"),
    ...item,
  };
}


export const getAppPreferences = ({ extensions }: Dependencies) => {
  return computed(() => (
    extensions.get()
      .flatMap((extension) => extension.appPreferences)
      .map(getRegisteredItem)
  ));
};
