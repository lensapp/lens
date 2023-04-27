/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { KubeObject } from "@k8slens/kube-object";
import type { KubeObjectStatus } from "../../../common/k8s-api/kube-object-status";
import type { IComputedValue } from "mobx";

export interface KubeObjectStatusText {
  kind: string;
  apiVersions: string[];
  resolve: (object: KubeObject) => KubeObjectStatus | null;
  enabled: IComputedValue<boolean>;
}

export const kubeObjectStatusTextInjectionToken =
  getInjectionToken<KubeObjectStatusText>({
    id: "kube-object-status-text-injection-token",
  });
