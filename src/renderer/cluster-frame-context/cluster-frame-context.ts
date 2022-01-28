/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Cluster } from "../../common/cluster/cluster";
import type { ClusterContext } from "../../common/k8s-api/cluster-context";
import { computed, IComputedValue, makeObservable } from "mobx";

export interface FrameContextDependencies {
  readonly cluster: Cluster;
  readonly namespaces: IComputedValue<string[]>;
  readonly selectedNamespaces: IComputedValue<string[]>;
}

export class FrameContext implements ClusterContext {
  constructor(protected readonly dependencies: FrameContextDependencies) {
    makeObservable(this);
  }

  get cluster() {
    return this.dependencies.cluster;
  }

  @computed get allNamespaces(): string[] {
    // user given list of namespaces
    if (this.cluster.accessibleNamespaces.length) {
      return this.cluster.accessibleNamespaces;
    }

    const namespaces = this.dependencies.namespaces.get();

    if (namespaces.length > 0) {
      // namespaces from kubernetes api
      return namespaces;
    } else {
      // fallback to cluster resolved namespaces because we could not load list
      return this.cluster.allowedNamespaces || [];
    }
  }

  get contextNamespaces(): string[] {
    return this.dependencies.selectedNamespaces.get();
  }

  @computed get hasSelectedAll(): boolean {
    const namespaces = new Set(this.contextNamespaces);

    return this.allNamespaces?.length > 1
      && this.cluster.accessibleNamespaces.length === 0
      && this.allNamespaces.every(ns => namespaces.has(ns));
  }
}
