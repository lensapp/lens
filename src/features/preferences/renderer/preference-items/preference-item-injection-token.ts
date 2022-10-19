/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type React from "react";
import type { ChildOfParentComposite, ParentOfChildComposite } from "../../../../common/utils/composite/interfaces";
import type { Discriminable } from "../../../../common/utils/composable-responsibilities/discriminable/discriminable";
import type { Labelable } from "../../../../common/utils/composable-responsibilities/labelable/labelable";
import type { Showable } from "../../../../common/utils/composable-responsibilities/showable/showable";
import type { Orderable } from "../../../../common/utils/composable-responsibilities/orderable/orderable";

export type PreferenceItemComponent<T> = React.ComponentType<{
  children: React.ReactElement;
  item: T;
}>;

export type PreferenceTab =
  & Discriminable<"tab">
  & ParentOfChildComposite
  & ChildOfParentComposite
  & Showable
  & Labelable
  & Orderable
  & { pathId: string };

export type PreferenceTabGroup =
  & Discriminable<"tab-group">
  & ParentOfChildComposite
  & ChildOfParentComposite<"preference-tabs">
  & Showable
  & Labelable
  & Orderable
  & { iconName? : string };

interface RenderableWithSiblings<T extends PreferenceTypes> {
  childSeparator?: () => React.ReactElement;
  Component: PreferenceItemComponent<T>;
}

export type PreferencePage =
  & Discriminable<"page">
  & ParentOfChildComposite
  & ChildOfParentComposite
  & Showable
  & RenderableWithSiblings<PreferencePage>;

export type PreferenceBlock =
  & Discriminable<"block">
  & ParentOfChildComposite
  & ChildOfParentComposite
  & Showable
  & RenderableWithSiblings<PreferenceBlock>;

export type PreferenceTypes = PreferenceTabGroup | PreferenceTab | PreferenceBlock | PreferencePage;

export const preferenceItemInjectionToken = getInjectionToken<PreferenceTypes>({
  id: "preference-item-injection-token",
});

