/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { action, computed, type IComputedValue, observable, runInAction } from "mobx";
import { getInjectable } from "@ogre-tools/injectable";
import kubeDetailsUrlParamInjectable from "../kube-detail-params/kube-details-url.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import type { KubeObject } from "../../../common/k8s-api/kube-object";

export type KubeObjectDetailsItem = KubeObject;
export type KubeObjectDetailsValue = KubeObjectDetailsItem | Error | undefined;
export type KubeObjectDetailsComputedValue = IComputedValue<KubeObjectDetailsValue>;

const currentKubeObjectInDetailsInjectable = getInjectable({
  id: "current-kube-object-in-details",

  instantiate(di): KubeObjectDetailsComputedValue {
    const kubeObjectUrlParam = di.inject(kubeDetailsUrlParamInjectable);
    const apiManager = di.inject(apiManagerInjectable);
    const kubeObject = observable.box<KubeObjectDetailsValue>();

    return computed<KubeObjectDetailsValue>(() => {
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
