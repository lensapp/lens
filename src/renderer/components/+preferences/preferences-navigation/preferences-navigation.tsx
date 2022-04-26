/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Tab, Tabs } from "../../tabs";

import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import React from "react";
import type {
  PreferenceNavigationItem,
} from "./preference-navigation-items.injectable";
import preferenceNavigationItemsInjectable from "./preference-navigation-items.injectable";

import { observer } from "mobx-react";
import { Icon } from "../../icon";

interface Dependencies {
  navigationItems: IComputedValue<PreferenceNavigationItem[]>;
}

const NonInjectedPreferencesNavigation = ({
  navigationItems,
}: Dependencies) => {
  const generalNavItems = navigationItems.get().filter(item => !item.fromExtension);
  const extensionNavItems = navigationItems.get().filter(item => item.fromExtension);

  function renderTab(item: PreferenceNavigationItem) {
    return (
      <PreferencesNavigationTab
        key={item.id}
        item={item}
        data-testid={`tab-link-for-${item.id}`}
      />
    );
  }

  return (
    <Tabs
      className="flex column"
      scrollable={false}
      onChange={(item: PreferenceNavigationItem) => item.navigate()}
    >
      <div className="header">Preferences</div>

      {generalNavItems.map(renderTab)}

      {extensionNavItems.length > 0 && (
        <div data-testid="extension-settings">
          <hr/>
          <div className="header flex items-center">
            <Icon material="extension" smallest className="mr-3"/> Custom Settings
          </div>
          <div>
            {extensionNavItems.map(renderTab)}
          </div>
        </div>
      )}
    </Tabs>
  );
};

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
