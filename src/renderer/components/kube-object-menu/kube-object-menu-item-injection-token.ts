/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import type { KubeObjectMenuProps } from "./kube-object-menu";

export interface KubeObjectMenuItem {
  kind: string;
  apiVersions: string[];
  enabled: IComputedValue<boolean>;

  // TODO: Figure out why "KubeObject" does not work here.
  Component: React.ElementType<KubeObjectMenuProps<any>>;
  orderNumber: number;
}

export const kubeObjectMenuItemInjectionToken = getInjectionToken<KubeObjectMenuItem>({
  id: "kube-object-menu-item-injection-token",
});
