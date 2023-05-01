/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { NamespaceStore } from "./store";
import { getKubeStoreInjectable } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import namespaceApiInjectable from "../../../common/k8s-api/endpoints/namespace.api.injectable";
import assert from "assert";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import clusterFrameContextForClusterScopedResourcesInjectable from "../../cluster-frame-context/for-cluster-scoped-resources.injectable";
import clusterConfiguredAccessibleNamespacesInjectable from "../../cluster/accessible-namespaces.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import selectedNamespacesStorageInjectable from "../../../features/namespace-filtering/renderer/storage.injectable";

const namespaceStoreInjectable = getKubeStoreInjectable({
  id: "namespace-store",

  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectable), "namespaceStore is only available in certain environments");

    const api = di.inject(namespaceApiInjectable);

    return new NamespaceStore({
      context: di.inject(clusterFrameContextForClusterScopedResourcesInjectable),
      storage: di.inject(selectedNamespacesStorageInjectable),
      clusterConfiguredAccessibleNamespaces: di.inject(clusterConfiguredAccessibleNamespacesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, api);
  },
});

export default namespaceStoreInjectable;
