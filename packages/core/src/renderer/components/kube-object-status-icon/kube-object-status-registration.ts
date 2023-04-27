/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IComputedValue } from "mobx";
import type { KubeObject } from "@k8slens/kube-object";
import type { KubeObjectStatus } from "../../../common/k8s-api/kube-object-status";

export interface KubeObjectStatusRegistration {
  kind: string;
  apiVersions: string[];
  resolve: (object: KubeObject) => KubeObjectStatus;
  visible?: IComputedValue<boolean>;
}
