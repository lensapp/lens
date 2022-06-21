/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import type { PreferenceNavigationItem } from "./preference-navigation-items.injectable";
import { PreferencesNavigationTab } from "./preference-navigation-tab";
import generalPreferenceNavigationItemsInjectable from "./general-preference-navigation-items.injectable";

interface Dependencies {
  navigationItems: IComputedValue<PreferenceNavigationItem[]>;
}

function NonInjectedGeneralNavGroup(props: Dependencies) {
  if (!props.navigationItems.get().length) {
    return null;
  }

  return (
    <React.Fragment>
      <div className="header">Preferences</div>

      {props.navigationItems.get().map(item => (
        <PreferencesNavigationTab
          key={item.id}
          item={item}
          data-testid={`tab-link-for-${item.id}`}
        />
      ))}
    </React.Fragment>
  );
}

export const GeneralNavGroup = withInjectables<Dependencies>(
  NonInjectedGeneralNavGroup, 

  {
    getProps: (di) => ({
      navigationItems: di.inject(generalPreferenceNavigationItemsInjectable),
    }),
  },
);
