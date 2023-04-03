/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import userPreferenceDescriptorsInjectable from "./preference-descriptors.injectable";
import userPreferencesStateInjectable from "./state.injectable";

export type ResetTheme = () => void;

const resetThemeInjectable = getInjectable({
  id: "reset-theme",
  instantiate: (di): ResetTheme => {
    const state = di.inject(userPreferencesStateInjectable);
    const preferenceDescriptors = di.inject(userPreferenceDescriptorsInjectable);

    return action(() => {
      state.colorTheme = preferenceDescriptors.colorTheme.fromStore(undefined);
    });
  },
});

export default resetThemeInjectable;
