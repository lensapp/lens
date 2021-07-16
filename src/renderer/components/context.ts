/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import type { Cluster } from "../../main/cluster";
import { ClusterStore } from "../../common/cluster-store";
import { namespaceStore } from "./+namespaces/namespace.store";
import { getHostedClusterId } from "../utils";

export interface ClusterContext {
  cluster?: Cluster;
  allNamespaces: string[]; // available / allowed namespaces from cluster.ts
  contextNamespaces: string[]; // selected by user (see: namespace-select.tsx)
}

export const clusterContext: ClusterContext = {
  get cluster(): Cluster | null {
    return ClusterStore.getInstance().getById(getHostedClusterId());
  },

  get allNamespaces(): string[] {
    if (!this.cluster) {
      return [];
    }

    // user given list of namespaces
    if (this.cluster?.accessibleNamespaces.length) {
      return this.cluster.accessibleNamespaces;
    }

    if (namespaceStore.items.length > 0) {
      // namespaces from kubernetes api
      return namespaceStore.items.map((namespace) => namespace.getName());
    } else {
      // fallback to cluster resolved namespaces because we could not load list
      return this.cluster.allowedNamespaces || [];
    }
  },

  get contextNamespaces(): string[] {
    return namespaceStore.contextNamespaces ?? [];
  },
};
