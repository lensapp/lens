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
import { ApiManager } from "../api/api-manager";
import { namespacesApi } from "../api/endpoints";
import type { NamespaceStore } from "./+namespaces";

export function allNamespaces(cluster: Cluster | null) {
  if (!cluster) {
    return [];
  }

  // user given list of namespaces
  if (cluster?.accessibleNamespaces.length) {
    return cluster.accessibleNamespaces;
  }

  const namespaceStore = ApiManager.getInstance().getStore<NamespaceStore>(namespacesApi);

  if (namespaceStore.items.length > 0) {
    // namespaces from kubernetes api
    return namespaceStore.items.map((namespace) => namespace.getName());
  } else {
    // fallback to cluster resolved namespaces because we could not load list
    return cluster.allowedNamespaces || [];
  }
}

export function isLoadingFromAllNamespaces(cluster: Cluster | null, namespaces: string[]): boolean {
  const allKnown = allNamespaces(cluster);

  return allKnown.length > 1
    && cluster.accessibleNamespaces.length === 0
    && allKnown.every(ns => namespaces.includes(ns));
}

export function selectedNamespaces() {
  return ApiManager.getInstance().getStore<NamespaceStore>(namespacesApi).contextNamespaces;
}
