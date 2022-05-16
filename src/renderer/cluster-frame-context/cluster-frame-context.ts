/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Cluster } from "../../common/cluster/cluster";
import type { NamespaceStore } from "../components/+namespaces/store";
import type { ClusterContext } from "../../common/k8s-api/cluster-context";
import { computed, makeObservable } from "mobx";

interface Dependencies {
  namespaceStore: NamespaceStore;
}

export class ClusterFrameContext implements ClusterContext {
  constructor(public cluster: Cluster, private dependencies: Dependencies) {
    makeObservable(this);
  }

  @computed get allNamespaces(): string[] {
    // user given list of namespaces
    if (this.cluster.accessibleNamespaces.length) {
      return this.cluster.accessibleNamespaces;
    }

    if (this.dependencies.namespaceStore.items.length > 0) {
      // namespaces from kubernetes api
      return this.dependencies.namespaceStore.items.map((namespace) => namespace.getName());
    } else {
      // fallback to cluster resolved namespaces because we could not load list
      return this.cluster.allowedNamespaces || [];
    }
  }

  @computed get contextNamespaces(): string[] {
    return this.dependencies.namespaceStore.contextNamespaces;
  }

  @computed get hasSelectedAll(): boolean {
    const namespaces = new Set(this.contextNamespaces);

    return this.allNamespaces?.length > 1
      && this.cluster.accessibleNamespaces.length === 0
      && this.allNamespaces.every(ns => namespaces.has(ns));
  }
}
