/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { KubeJsonApi } from "@k8slens/kube-api";
import apiKubeInjectable from "./api-kube.injectable";

export type ApiKubeGet = KubeJsonApi["get"];

const apiKubeGetInjectable = getInjectable({
  id: "api-kube-get",
  instantiate: (di): ApiKubeGet => {
    const apiKube = di.inject(apiKubeInjectable);

    return (...params) => apiKube.get(...params);
  },
});

export default apiKubeGetInjectable;
