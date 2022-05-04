/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RequireAtLeastOne } from "type-fest";
import type { KubeObject } from "../../common/k8s-api/kube-object";
import type { BaseIconProps } from "../components/icon";

export interface KubeObjectContextMenuItem {
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
  menuItems: KubeObjectContextMenuItem[];
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
