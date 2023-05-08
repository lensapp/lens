/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import clusterFrameContextForNamespacedResourcesInjectable from "../../../renderer/cluster-frame-context/for-namespaced-resources.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import type { KubeApi } from "@k8slens/kube-api";
import type { KubeObject } from "@k8slens/kube-object";
import type { KubeObjectStoreDependencies } from "../kube-object.store";
import { CustomResourceStore } from "./resource.store";

export type CreateCustomResourceStore = <K extends KubeObject>(api: KubeApi<K>) => CustomResourceStore<K>;

const createCustomResourceStoreInjectable = getInjectable({
  id: "create-custom-resource-store",
  instantiate: (di): CreateCustomResourceStore => {
    const deps: KubeObjectStoreDependencies = {
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    };

    return (api) => new CustomResourceStore(deps, api);
  },
});

export default createCustomResourceStoreInjectable;
