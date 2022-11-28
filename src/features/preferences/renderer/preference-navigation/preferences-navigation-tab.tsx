/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Tab } from "../../../../renderer/components/tabs";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import type { PreferenceTab } from "../preference-items/preference-item-injection-token";
import type { IComputedValue } from "mobx";
import preferenceTabIsActiveInjectable from "./navigate-to-preference-tab/preference-tab-is-active.injectable";
import React from "react";

interface Dependencies {
  tabIsActive: IComputedValue<boolean>;
}

interface PreferenceNavigationTabProps {
  tab: PreferenceTab;
}

const NonInjectedPreferencesNavigationTab = observer(({
  tabIsActive,
  tab,
}: Dependencies & PreferenceNavigationTabProps) => (
  <Tab
    active={tabIsActive.get()}
    label={tab.label}
    data-preference-tab-link-test={tab.pathId}
    value={tab.pathId}
  />
));

export const PreferencesNavigationTab = withInjectables<Dependencies, PreferenceNavigationTabProps>(NonInjectedPreferencesNavigationTab, {
  getProps: (di, props) => ({
    ...props,
    tabIsActive: di.inject(preferenceTabIsActiveInjectable, props.tab.pathId),
  }),
});
