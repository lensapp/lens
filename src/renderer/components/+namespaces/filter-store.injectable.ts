/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import currentClusterInjectable from "../current-cluster.injectable";
import namespaceSelectFilterStorageInjectable from "./filter-storage.injectable";
import { NamespaceSelectFilterManager } from "./filter-store";
import namespacesInjectable from "./namespaces.injectable";

const namespaceFilterStoreInjectable = getInjectable({
  instantiate: (di) => {
    const cluster = di.inject(currentClusterInjectable);

    return new NamespaceSelectFilterManager({
      storage: di.inject(namespaceSelectFilterStorageInjectable),
      namespaces: di.inject(namespacesInjectable),
      accessibleNamespaces: computed(() => [...(cluster.get()?.accessibleNamespaces ?? [])]),
    });
  },
  lifecycle: lifecycleEnum.singleton,
});

export default namespaceFilterStoreInjectable;
