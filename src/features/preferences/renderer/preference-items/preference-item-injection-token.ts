/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import type React from "react";

export type PreferenceItemComponent<T> = React.ComponentType<{
  children: React.ReactElement;
  item: T;
}>;

export interface PreferenceTab {
  kind: "tab";
  id: string;
  parentId: string;
  pathId: string;
  label: string;
  orderNumber: number;
  isShown?: IComputedValue<boolean> | boolean;
}

export interface PreferenceTabGroup {
  kind: "tab-group";
  id: string;
  parentId: "preference-tabs";
  label: string;
  orderNumber: number;
  isShown?: IComputedValue<boolean> | boolean;
  iconName?: string;
}

export interface PreferencePage {
  kind: "page";
  id: string;
  parentId: string;
  isShown?: IComputedValue<boolean> | boolean;
  childrenSeparator?: () => React.ReactElement;
  Component: PreferenceItemComponent<PreferencePage>;
}

export interface PreferenceItem {
  kind: "item";
  id: string;
  parentId: string;
  orderNumber: number;
  isShown?: IComputedValue<boolean> | boolean;
  childrenSeparator?: () => React.ReactElement;
  Component: PreferenceItemComponent<PreferenceItem>;
}

export type PreferenceTypes = PreferenceTabGroup | PreferenceTab | PreferenceItem | PreferencePage;

export const preferenceItemInjectionToken = getInjectionToken<PreferenceTypes>({
  id: "preference-item-injection-token",
});

