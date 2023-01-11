/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import type React from "react";

export interface KubeObjectDetailItem {
  Component: React.ElementType<KubeObjectDetailsProps<any>>;
  enabled: IComputedValue<boolean>;
  orderNumber: number;
}

export const kubeObjectDetailItemInjectionToken = getInjectionToken<KubeObjectDetailItem>({
  id: "kube-object-detail-item-injection-token",
});
