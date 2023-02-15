/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DerivedKubeApiOptions, KubeApiDependencies } from "../kube-api";
import { KubeApi } from "../kube-api";
import type { ClusterScopedMetadata, KubeObjectStatus } from "../kube-object";
import { KubeObject } from "../kube-object";

export enum NamespaceStatusKind {
  ACTIVE = "Active",
  TERMINATING = "Terminating",
}

export interface NamespaceSpec {
  finalizers?: string[];
}

export interface NamespaceStatus extends KubeObjectStatus {
  phase?: string;
}

export class Namespace extends KubeObject<
  ClusterScopedMetadata,
  NamespaceStatus,
  NamespaceSpec
> {
  static readonly kind = "Namespace";
  static readonly namespaced = false;
  static readonly apiBase = "/api/v1/namespaces";

  getStatus() {
    return this.status?.phase ?? "-";
  }

  isSubnamespace() {  
    return this.getAnnotations().find(annotation => annotation.includes("hnc.x-k8s.io/subnamespace-of"));
  }

  isChildOf(parentName: string) {
    return this.getLabels().find(label => label === `${parentName}.tree.hnc.x-k8s.io/depth=1`);
  }

  isControlledByHNC() {
    const hierarchicalNamesaceControllerLabel = "hnc.x-k8s.io/included-namespace=true";

    return this.getLabels().find(label => label === hierarchicalNamesaceControllerLabel);
  }
}

export class NamespaceApi extends KubeApi<Namespace> {
  constructor(deps: KubeApiDependencies, opts?: DerivedKubeApiOptions) {
    super(deps, {
      ...opts ?? {},
      objectConstructor: Namespace,
    });
  }
}
