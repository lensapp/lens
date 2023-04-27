/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeObject } from "@k8slens/kube-object";
import type { KubeObjectDetailsProps } from "./kube-object-details";
import type React from "react";
import type { IComputedValue } from "mobx";

export interface KubeObjectDetailComponents<T extends KubeObject = KubeObject> {
  Details: React.ComponentType<KubeObjectDetailsProps<T>>;
}

export interface KubeObjectDetailRegistration<T extends KubeObject = KubeObject> {
  kind: string;
  apiVersions: string[];
  components: KubeObjectDetailComponents<T>;
  priority?: number;
  visible?: IComputedValue<boolean>;
}
