/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import kubeDetailsUrlParamInjectable from "../kube-detail-params/kube-details-url.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import type { KubeObject } from "@k8slens/kube-object";

export type CurrentKubeObject =
  | undefined
  | { object: KubeObject; error?: undefined }
  | { object?: undefined; error: string };

const currentKubeObjectInDetailsInjectable = getInjectable({
  id: "current-kube-object-in-details",

  instantiate: (di) => {
    const urlParam = di.inject(kubeDetailsUrlParamInjectable);
    const apiManager = di.inject(apiManagerInjectable);

    return asyncComputed({
      betweenUpdates: "show-latest-value",

      async getValueFromObservedPromise(): Promise<CurrentKubeObject> {
        const path = urlParam.get();
        const store = apiManager.getStore(path);

        if (!store) {
          return undefined;
        }

        try {
          const object = store.getByPath(path) ?? await store.loadFromPath(path);

          return { object };
        } catch (error) {
          return { error: String(error) };
        }
      },
    });
  },
});

export default currentKubeObjectInDetailsInjectable;
