/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import kubeDetailsUrlParamInjectable from "../kube-detail-params/kube-details-url.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import type { KubeObject } from "../../../common/k8s-api/kube-object";

export type KubeObjectDetailsItem = KubeObject;
export type KubeObjectDetailsValue = KubeObjectDetailsItem | Error | undefined;

const currentKubeObjectInDetailsInjectable = getInjectable({
  id: "current-kube-object-in-details-async-computed",

  instantiate: (di) => {
    const urlParam = di.inject(kubeDetailsUrlParamInjectable);
    const apiManager = di.inject(apiManagerInjectable);

    return asyncComputed<KubeObjectDetailsValue>({
      betweenUpdates: "show-latest-value",

      async getValueFromObservedPromise() {
        const path = urlParam.get();
        const store = apiManager.getStore(path);

        if (!store) {
          return undefined;
        }

        try {
          return store.getByPath(path) ?? await store.loadFromPath(path);
        } catch (error) {
          return Error(String(error));
        }
      },
    });
  },
});

export default currentKubeObjectInDetailsInjectable;
