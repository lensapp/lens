/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type React from "react";
import type { ChildOfParentComposite, ParentOfChildComposite } from "../../../../common/utils/composite/interfaces";
import type { Discriminable } from "../../../../common/utils/composable-responsibilities/discriminable/discriminable";
import type { Labelable } from "../../../../common/utils/composable-responsibilities/labelable/labelable";
import type { MaybeShowable } from "../../../../common/utils/composable-responsibilities/showable/showable";
import type { Orderable, MaybeOrderable } from "@k8slens/utilities";
import type { GetSeparator } from "../../../../common/utils/add-separator/add-separator";
import type { Composite } from "../../../../common/utils/composite/get-composite/get-composite";

export type ChildrenAreSeparated =
  & { childSeparator: GetSeparator<Composite<PreferenceItemTypes>, React.ReactElement> };

export type ChildrenAreMaybeSeparated =
  & Partial<ChildrenAreSeparated>;

export type PreferenceItemComponent<T> = React.ComponentType<{
  children: React.ReactElement;
  item: T;
}>;

export type PreferenceTab =
  & Discriminable<"tab">
  & ParentOfChildComposite
  & ChildOfParentComposite
  & MaybeShowable
  & Labelable
  & Orderable
  & { pathId: string };

export type PreferenceTabGroup =
  & Discriminable<"tab-group">
  & ParentOfChildComposite
  & ChildOfParentComposite<"preference-tabs">
  & MaybeShowable
  & Labelable
  & Orderable
  & { iconName? : string };

interface RenderableWithSiblings<T extends PreferenceItemTypes>
  extends ChildrenAreMaybeSeparated {
  Component: PreferenceItemComponent<T>;
}

export type PreferencePage =
  & Discriminable<"page">
  & ParentOfChildComposite
  & ChildOfParentComposite
  & MaybeOrderable
  & MaybeShowable
  & RenderableWithSiblings<PreferencePage>;

export type PreferenceBlock =
  & Discriminable<"block">
  & ParentOfChildComposite
  & ChildOfParentComposite
  & MaybeOrderable
  & MaybeShowable
  & RenderableWithSiblings<PreferenceBlock>;

export type PreferenceItemTypes = PreferenceTabGroup | PreferenceTab | PreferenceBlock | PreferencePage;

export const preferenceItemInjectionToken = getInjectionToken<PreferenceItemTypes>({
  id: "preference-item-injection-token",
});

