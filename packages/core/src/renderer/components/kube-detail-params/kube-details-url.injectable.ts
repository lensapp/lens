/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createPageParamInjectable from "../../navigation/create-page-param.injectable";

/**
 * Used to store `object.selfLink` to show more info about resource in the details panel.
 */
const kubeDetailsUrlParamInjectable = getInjectable({
  id: "kube-details-url-param",
  instantiate: (di) => {
    const createPageParam = di.inject(createPageParamInjectable);

    return createPageParam({
      name: "kube-details",
    });
  },
});

export default kubeDetailsUrlParamInjectable;
