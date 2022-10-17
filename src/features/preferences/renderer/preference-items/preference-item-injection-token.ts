/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type React from "react";

export type PreferenceItemComponent = React.ComponentType<{ children: React.ReactElement }>;

export interface PreferenceTab {
  kind: "tab";
  id: string;
  parentId: string;
  pathId: string;
  testId: string;
  label: string;
  orderNumber: number;
  isShown?: boolean;
}

export interface PreferenceTabGroup {
  kind: "tab-group";
  id: string;
  parentId: "preference-tabs";
  testId: string;
  label: string;
  orderNumber: number;
  isShown?: boolean;
  iconName?: string;
}

export interface PreferencePage {
  kind: "page";
  id: string;
  parentId: string;
  isShown?: boolean;
  childrenSeparator?: () => React.ReactElement;
  Component: PreferenceItemComponent;
}

export interface PreferenceGroup {
  kind: "group";
  id: string;
  parentId: string;
  isShown?: boolean;
  childrenSeparator?: () => React.ReactElement;
}

export interface PreferenceItem {
  kind: "item";
  Component: PreferenceItemComponent;
  id: string;
  parentId: string;
  orderNumber: number;
  isShown?: boolean;
  childrenSeparator?: () => React.ReactElement;
}

export type PreferenceTypes = PreferenceTabGroup | PreferenceTab | PreferenceItem | PreferencePage | PreferenceGroup;

export const preferenceItemInjectionToken = getInjectionToken<PreferenceTypes>({
  id: "preference-item-injection-token",
});

