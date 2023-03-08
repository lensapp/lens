/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import allNamespacesInjectable from "./all-namespaces.injectable";
import hostedClusterInjectable from "./hosted-cluster.injectable";

export type IsNamespaceListSufficientToLoadFromAllNamespaces = (namespace: string[]) => boolean;

const isNamespaceListSufficientToLoadFromAllNamespacesInjectable = getInjectable({
  id: "is-namespace-list-sufficient-to-load-from-all-namespaces",
  instantiate: (di): IsNamespaceListSufficientToLoadFromAllNamespaces => {
    const cluster = di.inject(hostedClusterInjectable);

    assert(cluster, "This can only be injected within a cluster frame");

    const allNamespaces = di.inject(allNamespacesInjectable);

    return (namespaces) => (
      allNamespaces.get().length > 1
      && cluster.accessibleNamespaces.length === 0
      && allNamespaces.get().every(ns => namespaces.includes(ns))
    );
  },
});

export default isNamespaceListSufficientToLoadFromAllNamespacesInjectable;
