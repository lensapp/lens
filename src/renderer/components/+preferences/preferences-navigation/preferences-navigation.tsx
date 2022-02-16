/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Tab, Tabs } from "../../tabs";

import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import React from "react";
import preferenceNavigationItemsInjectable, {
  PreferenceNavigationItem,
} from "./preference-navigation-items.injectable";

import { observer } from "mobx-react";

interface Dependencies {
  navigationItems: IComputedValue<PreferenceNavigationItem[]>;
}

const NonInjectedPreferencesNavigation = ({
  navigationItems,
}: Dependencies) => (
  <Tabs
    className="flex column"
    scrollable={false}
    onChange={(item: PreferenceNavigationItem) => item.navigate()}
  >
    <div className="header">Preferences</div>

    {navigationItems.get().map((item) => (
      <PreferencesNavigationTab
        key={item.id}
        item={item}
        data-testid={`tab-link-for-${item.id}`}
      />
    ))}
  </Tabs>
);

interface PreferenceNavigationTabProps extends React.DOMAttributes<HTMLElement> {
  item: PreferenceNavigationItem;
}

const PreferencesNavigationTab = observer(({ item }: PreferenceNavigationTabProps) => (
  <Tab
    value={item}
    label={item.label}
    data-testid={`tab-link-for-${item.id}`}
    active={item.isActive.get()}
  />
));

export const PreferencesNavigation = withInjectables<Dependencies>(
  NonInjectedPreferencesNavigation,

  {
    getProps: (di) => ({
      navigationItems: di.inject(preferenceNavigationItemsInjectable),
    }),
  },
);
