/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import type { Namespace } from "../../../common/k8s-api/endpoints";
import removeSubnamespaceInjectable from "./remove-subnamespace.injectable";
import namespaceStoreInjectable from "./store.injectable";

const deleteNamespaceInjectable = getInjectable({
  id: "delete-namespace",

  instantiate: (di) => {
    const namespaceStore = di.inject(namespaceStoreInjectable);
    const removeSubnamespace = di.inject(removeSubnamespaceInjectable);

    return async (namespace: Namespace) => {
      if (namespace.isSubnamespace()) {
        return await removeSubnamespace(namespace.getName());
      }

      return await namespaceStore.remove(namespace);
    }
  }
});

export default deleteNamespaceInjectable;