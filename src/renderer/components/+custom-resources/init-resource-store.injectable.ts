/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import type { CustomResourceDefinition } from "../../../common/k8s-api/endpoints";
import { KubeApi } from "../../../common/k8s-api/kube-api";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import { CustomResourceStore } from "./resource.store";

export type InitCustomResourceStore = (crd: CustomResourceDefinition) => void;

const initCustomResourceStoreInjectable = getInjectable({
  id: "init-custom-resource-store",
  instantiate: (di): InitCustomResourceStore => {
    const apiManager = di.inject(apiManagerInjectable);

    return (crd) => {
      const objectConstructor = class extends KubeObject {
        static readonly kind = crd.getResourceKind();
        static readonly namespaced = crd.isNamespaced();
        static readonly apiBase = crd.getResourceApiBase();
      };

      const api = apiManager.getApi(objectConstructor.apiBase)
        ?? new KubeApi({ objectConstructor });

      if (!apiManager.getStore(api)) {
        apiManager.registerStore(new CustomResourceStore(api));
      }
    };
  },
});

export default initCustomResourceStoreInjectable;
