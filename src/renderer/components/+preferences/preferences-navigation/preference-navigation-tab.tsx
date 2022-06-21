/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { observer } from "mobx-react";
import React from "react";
import { Tab } from "../../tabs";
import type { PreferenceNavigationItem } from "./preference-navigation-items.injectable";

interface PreferenceNavigationTabProps extends React.DOMAttributes<HTMLElement> {
  item: PreferenceNavigationItem;
}

export const PreferencesNavigationTab = observer(({ item }: PreferenceNavigationTabProps) => (
  <Tab
    value={item}
    label={item.label}
    data-testid={`tab-link-for-${item.id}`}
    active={item.isActive.get()}
  />
));
