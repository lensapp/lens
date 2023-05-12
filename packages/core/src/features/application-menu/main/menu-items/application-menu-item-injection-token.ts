/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { BrowserWindow, KeyboardEvent, MenuItemConstructorOptions, MenuItem as ElectronMenuItem } from "electron";
import type { SetOptional } from "type-fest";
import type { ChildOfParentComposite, ParentOfChildComposite } from "../../../../common/utils/composite/interfaces";
import type { MaybeShowable } from "../../../../common/utils/composable-responsibilities/showable/showable";
import type { Discriminable } from "../../../../common/utils/composable-responsibilities/discriminable/discriminable";
import type { Orderable } from "@k8slens/utilities";

export interface MayHaveKeyboardShortcut {
  keyboardShortcut?: string;
}

export interface ElectronClickable {
  // TODO: This leaky abstraction is exposed in Extension API, therefore cannot be updated
  onClick: (menuItem: ElectronMenuItem, browserWindow: (BrowserWindow) | (undefined), event: KeyboardEvent) => void;
}

export interface Labeled {
  label: string;
}

export interface MaybeLabeled extends SetOptional<Labeled, "label"> {}

type ApplicationMenuItemType<T extends string> =
  // Note: "kind" is being used for Discriminated unions of TypeScript to achieve type narrowing.
  // See: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
  & Discriminable<T>
  & ParentOfChildComposite
  & ChildOfParentComposite
  & MaybeShowable
  & Orderable;

export type TopLevelMenu =
  & ApplicationMenuItemType<"top-level-menu">
  & { parentId: "root" }
  & Labeled
  & MayHaveElectronRole;

interface MayHaveElectronRole {
  role?: ElectronRoles;
}

type ElectronRoles = Exclude<MenuItemConstructorOptions["role"], undefined>;

export type SubMenu =
  & ApplicationMenuItemType<"sub-menu">
  & Labeled
  & ChildOfParentComposite;

export type ClickableMenuItem =
  & ApplicationMenuItemType<"clickable-menu-item">
  & MenuItem
  & Labeled
  & ElectronClickable;

export type OsActionMenuItem =
  & ApplicationMenuItemType<"os-action-menu-item">
  & MenuItem
  & MaybeLabeled
  & TriggersElectronAction;

type MenuItem =
  & ChildOfParentComposite
  & MayHaveKeyboardShortcut;

interface TriggersElectronAction {
  actionName: ElectronRoles;
}

// Todo: SeparatorMenuItem
export type Separator =
  & ApplicationMenuItemType<"separator">
  & ChildOfParentComposite;

export type ApplicationMenuItemTypes =
  | TopLevelMenu
  | SubMenu
  | OsActionMenuItem
  | ClickableMenuItem
  | Separator
;

const applicationMenuItemInjectionToken = getInjectionToken<ApplicationMenuItemTypes>({
  id: "application-menu-item-injection-token",
});

export default applicationMenuItemInjectionToken;
