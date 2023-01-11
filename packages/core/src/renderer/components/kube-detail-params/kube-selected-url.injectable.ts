/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createPageParamInjectable from "../../navigation/create-page-param.injectable";
import kubeDetailsUrlParamInjectable from "./kube-details-url.injectable";

/**
 * Used to highlight last active/selected table row with the resource.
 *
 * @example
 * If we go to "Nodes (page) -> Node (details) -> Pod (details)",
 * last clicked Node should be "active" while Pod details are shown).
 */
const kubeSelectedUrlParamInjectable = getInjectable({
  id: "kube-selected-url-param",
  instantiate: (di) => {
    const createPageParam = di.inject(createPageParamInjectable);
    const kubeDetailsUrlParam = di.inject(kubeDetailsUrlParamInjectable);

    return createPageParam({
      name: "kube-selected",
      get defaultValue() {
        return kubeDetailsUrlParam.get();
      },
    });
  },
});

export default kubeSelectedUrlParamInjectable;
