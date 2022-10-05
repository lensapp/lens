/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { BrowserWindow, KeyboardEvent, MenuItemConstructorOptions, MenuItem as ElectronMenuItem } from "electron";
import type { SetOptional } from "type-fest";

export interface MayHaveKeyboardShortcut {
  keyboardShortcut?: string;
}

export interface Showable {
  isShown?: boolean;
}
export const isShown = (showable: Showable) => showable.isShown !== false;

export interface Clickable {
  // TODO: This leaky abstraction is exposed in Extension API, therefore cannot be updated
  onClick: (menuItem: ElectronMenuItem, browserWindow: (BrowserWindow) | (undefined), event: KeyboardEvent) => void;
}

export interface Labeled {
  label: string;
}

export interface MaybeLabeled extends SetOptional<Labeled, "label"> {}

export interface CanBeChildOfParent {
  parentId: string;
}

export interface Orderable {
  orderNumber: number;
}

export interface Identifiable {
  id: string;
}

type ApplicationMenuItemType<T extends string> =
  // Note: "kind" is being used for Discriminated unions of TypeScript to achieve type narrowing.
  // See: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
  & Kind<T>
  & Identifiable
  & CanBeChildOfParent
  & Showable
  & Orderable;

interface Kind<T extends string> { kind: T }

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
  & CanBeChildOfParent;

export type ClickableMenuItem =
  & ApplicationMenuItemType<"clickable-menu-item">
  & MenuItem
  & Labeled
  & Clickable;

export type OsActionMenuItem =
  & ApplicationMenuItemType<"os-action-menu-item">
  & MenuItem
  & MaybeLabeled
  & TriggersElectronAction;

type MenuItem =
  & CanBeChildOfParent
  & MayHaveKeyboardShortcut;

interface TriggersElectronAction {
  actionName: ElectronRoles;
}

// Todo: SeparatorMenuItem
export type Separator =
  & ApplicationMenuItemType<"separator">
  & CanBeChildOfParent;

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
