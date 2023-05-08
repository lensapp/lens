/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { KubeJsonApi } from "@k8slens/kube-api";
import apiKubeInjectable from "./api-kube.injectable";

export type ApiKubePatch = KubeJsonApi["patch"];

const apiKubePatchInjectable = getInjectable({
  id: "api-kube-patch",
  instantiate: (di): ApiKubePatch => {
    const apiKube = di.inject(apiKubeInjectable);

    return (...params) => apiKube.patch(...params);
  },
});

export default apiKubePatchInjectable;
