/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import kubeDetailsUrlParamInjectable from "../kube-detail-params/kube-details-url.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import loggerInjectable from "../../../common/logger.injectable";

const currentKubeObjectInDetailsInjectable = getInjectable({
  id: "current-kube-object-in-details",

  instantiate: (di) => {
    const urlParam = di.inject(kubeDetailsUrlParamInjectable);
    const apiManager = di.inject(apiManagerInjectable);
    const logger = di.inject(loggerInjectable);

    return computed(() => {
      const path = urlParam.get();

      try {
        return apiManager.getStore(path)?.getByPath(path);
      } catch (error) {
        logger.error(
          `[KUBE-OBJECT-DETAILS]: failed to get store or object ${path}: ${error}`,
        );

        return undefined;
      }
    });
  },
});

export default currentKubeObjectInDetailsInjectable;
