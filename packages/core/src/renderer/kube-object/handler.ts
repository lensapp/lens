/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { IObservableArray } from "mobx";
import type { RequireAtLeastOne } from "type-fest";
import type { KubeObject } from "@k8slens/kube-object";
import type { BaseIconProps } from "../components/icon";

export interface KubeObjectContextMenuItem {
  id?: string;
  /**
   * If the type is `string` then it is shorthand for {@link BaseIconProps.material}
   *
   * This is required because this item can be either rendered as a context menu or as a toolbar in
   * the kube object details page.
   */
  icon: string | BaseIconProps;

  /**
   * The title text for the menu item or the hover text for the icon.
   */
  title: string;

  /**
   * The action when clicked
   */
  onClick: (obj: KubeObject) => void;
}

export interface KubeObjectOnContextMenuOpenContext {
  readonly menuItems: IObservableArray<KubeObjectContextMenuItem>;
  navigate: (location: string) => void;
}

export type KubeObjectOnContextMenuOpen = (ctx: KubeObjectOnContextMenuOpenContext) => void;

export interface KubeObjectHandlers {
  onContextMenuOpen: KubeObjectOnContextMenuOpen;
}

export type KubeObjectHandlerRegistration = {
  apiVersions: string[];
  kind: string;
} & RequireAtLeastOne<KubeObjectHandlers>;

export const staticKubeObjectHandlerInjectionToken = getInjectionToken<KubeObjectHandlerRegistration>({
  id: "static-kube-object-handler-token",
});
