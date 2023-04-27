/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { waitUntilDefined } from "@k8slens/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import customResourceDefinitionStoreInjectable from "../custom-resources/definition.store.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import type { Namespace } from "@k8slens/kube-object";

export type RequestDeleteSubNamespaceAnchor = (namespace: Namespace) => Promise<void>;

const requestDeleteSubNamespaceAnchorInjectable = getInjectable({
  id: "request-delete-sub-namespace-anchor",
  instantiate: (di): RequestDeleteSubNamespaceAnchor => {
    const crdStore = di.inject(customResourceDefinitionStoreInjectable);
    const apiManager = di.inject(apiManagerInjectable);

    return async (namespace) => {
      const anchorCrd = await waitUntilDefined(() => crdStore.getByGroup("hnc.x-k8s.io", "subnamespaceanchors"));
      const anchorApi = apiManager.getApi(anchorCrd.getResourceApiBase());

      await anchorApi?.delete({ name: namespace.getName() });
    };
  },
});

export default requestDeleteSubNamespaceAnchorInjectable;
