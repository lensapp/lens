/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import namespaceStoreInjectable from "../store.injectable";

export type FilterByNamespace = (namespace: string) => void;

const filterByNamespaceInjectable = getInjectable({
  id: "filter-by-namespace",
  instantiate: (di): FilterByNamespace => {
    const namespaceStore = di.inject(namespaceStoreInjectable);

    return (namespace) => namespaceStore.selectSingle(namespace);
  },
});

export default filterByNamespaceInjectable;
