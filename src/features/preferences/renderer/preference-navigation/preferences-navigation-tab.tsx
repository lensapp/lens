/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Tab } from "../../../../renderer/components/tabs";
import navigateToPreferenceTabInjectable from "./navigate-to-preference-tab/navigate-to-preference-tab.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import type { PreferenceTab } from "../preference-items/preference-item-injection-token";
import type { IComputedValue } from "mobx";
import preferenceTabIsActiveInjectable from "./navigate-to-preference-tab/preference-tab-is-active.injectable";
import React from "react";

interface Dependencies {
  navigateToTab: (tabId: string) => void;
  tabIsActive: IComputedValue<boolean>;
}

interface PreferenceNavigationTabProps {
  tab: PreferenceTab;
}

const NonInjectedPreferencesNavigationTab = observer(({ navigateToTab, tabIsActive, tab } : Dependencies & PreferenceNavigationTabProps) => (
  <Tab
    onClick={() => navigateToTab(tab.pathId)}
    active={tabIsActive.get()}
    label={tab.label}
    data-preference-tab-link-test={tab.pathId}
  />
));

export const PreferencesNavigationTab = withInjectables<Dependencies, PreferenceNavigationTabProps>(
  NonInjectedPreferencesNavigationTab,

  {
    getProps: (di, props) => ({
      navigateToTab: di.inject(navigateToPreferenceTabInjectable),
      tabIsActive: di.inject(preferenceTabIsActiveInjectable, props.tab.pathId),
      ...props,
    }),
  },
);
