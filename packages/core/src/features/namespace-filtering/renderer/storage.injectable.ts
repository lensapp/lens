/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import hostedClusterInjectable from "../../../renderer/cluster-frame-context/hosted-cluster.injectable";
import createStorageInjectable from "../../../renderer/utils/create-storage/create-storage.injectable";

const selectedNamespacesStorageInjectable = getInjectable({
  id: "selected-namespaces-storage",
  instantiate: (di) => {
    const createStorage = di.inject(createStorageInjectable);
    const cluster = di.inject(hostedClusterInjectable);

    assert(cluster, "selectedNamespacesStorage is only available in certain environments");

    const defaultSelectedNamespaces = cluster.allowedNamespaces.includes("default")
      ? ["default"]
      : cluster.allowedNamespaces.slice(0, 1);

    return createStorage("selected_namespaces", defaultSelectedNamespaces);
  },
});

export default selectedNamespacesStorageInjectable;
