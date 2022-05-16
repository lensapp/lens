/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import observableHistoryInjectable from "../../navigation/observable-history.injectable";
import kubeDetailsUrlParamInjectable from "./kube-details-url.injectable";
import kubeSelectedUrlParamInjectable from "./kube-selected-url.injectable";

export type GetDetailsUrl = (selfLink: string, resetSelected?: boolean, mergeGlobals?: boolean) => string;

const getDetailsUrlInjectable = getInjectable({
  id: "get-details-url",
  instantiate: (di): GetDetailsUrl => {
    const observableHistory = di.inject(observableHistoryInjectable);
    const kubeDetailsUrlParam = di.inject(kubeDetailsUrlParamInjectable);
    const kubeSelectedUrlParam = di.inject(kubeSelectedUrlParamInjectable);

    return (selfLink, resetSelected = false, mergeGlobals = true) => {
      const params = new URLSearchParams(mergeGlobals ? observableHistory.searchParams : "");

      params.set(kubeDetailsUrlParam.name, selfLink);

      if (resetSelected) {
        params.delete(kubeSelectedUrlParam.name);
      } else {
        params.set(kubeSelectedUrlParam.name, kubeSelectedUrlParam.get());
      }

      return `?${params}`;
    };
  },
});

export default getDetailsUrlInjectable;
