/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import type { PreferenceNavigationItem } from "./preference-navigation-items.injectable";
import { Icon } from "../../icon";
import { PreferencesNavigationTab } from "./preference-navigation-tab";
import preferenceNavigationItemsForGroupInjectable from "./preference-navigation-items-for-group.injectable";
import { observer } from "mobx-react";

interface Dependencies {
  navigationItems: IComputedValue<PreferenceNavigationItem[]>;
}

const NonInjectedExtensionsNavGroup = observer((props: Dependencies) => {
  if (!props.navigationItems.get().length) {
    return null;
  }

  return (
    <div data-testid="extension-settings">
      <hr/>
      <div className="header flex items-center">
        <Icon
          material="extension"
          smallest
          className="mr-3"
        />
        {" "}
        Extensions
      </div>
      <div>
        {props.navigationItems.get().map(item => (
          <PreferencesNavigationTab
            key={item.id}
            item={item}
            data-testid={`tab-link-for-${item.id}`}
          />
        ))}
      </div>
    </div>
  );
});

export const ExtensionsNavGroup = withInjectables<Dependencies>(
  NonInjectedExtensionsNavGroup,

  {
    getProps: (di) => ({
      navigationItems: di.inject(preferenceNavigationItemsForGroupInjectable, "extensions"),
    }),
  },
);
