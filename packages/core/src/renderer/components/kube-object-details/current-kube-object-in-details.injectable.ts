/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import kubeDetailsUrlParamInjectable from "../kube-detail-params/kube-details-url.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import type { IComputedValue } from "mobx";
import { action, computed, observable, runInAction } from "mobx";

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
      getValueFromObservedPromise: async (): Promise<CurrentKubeObject> => {
        const path = urlParam.get();
        const store = apiManager.getStore(path);

        if (!store) {
          return undefined;
        }

        try {
          const object = await store.loadFromPath(path);

          return { object };
        } catch (error) {
          return { error: String(error) };
        }
      },
    });
  },
});

export type KubeObjectDetailsItemValue = KubeObject | Error | undefined;
export type KubeObjectDetailsItemComputed = IComputedValue<KubeObjectDetailsItemValue>;

export const currentKubeObjectInDetailsInjectable2 = getInjectable({
  id: "current-kube-object-in-details-2",

  instantiate(di): KubeObjectDetailsItemComputed {
    const kubeObjectUrlParam = di.inject(kubeDetailsUrlParamInjectable);
    const apiManager = di.inject(apiManagerInjectable);
    const kubeObject = observable.box<KubeObjectDetailsItemValue>();

    return computed(() => {
      const kubeObjUrlPath = kubeObjectUrlParam.get();

      if (!kubeObjUrlPath) return; // details panel is hidden

      const store = apiManager.getStore(kubeObjUrlPath);
      const object = store?.getByPath(kubeObjUrlPath);

      if (!object) {
        store?.loadFromPath(kubeObjUrlPath)
          .then(action((obj) => kubeObject.set(obj)))
          .catch(action((error) => kubeObject.set(Error(error))));
      } else {
        runInAction(() => kubeObject.set(object));
      }

      return kubeObject.get() ?? object;
    });
  },
});

export default currentKubeObjectInDetailsInjectable;
