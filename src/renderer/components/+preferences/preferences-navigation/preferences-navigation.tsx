/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { Tabs } from "../../tabs";
import { ExtensionsNavGroup } from "./extensions-nav-group";
import { GeneralNavGroup } from "./general-nav-group";
import type {
  PreferenceNavigationItem,
} from "./preference-navigation-items.injectable";

export const PreferencesNavigation = () => {
  return (
    <Tabs
      className="flex column"
      scrollable={false}
      onChange={(item: PreferenceNavigationItem) => item.navigate()}
    >
      <GeneralNavGroup/>
      <ExtensionsNavGroup/>
    </Tabs>
  );
};
