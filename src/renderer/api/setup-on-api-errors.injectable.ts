/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { apiBase } from "../../common/k8s-api";
import apiKubeInjectable from "../../common/k8s-api/api-kube.injectable";
import { onApiError } from "./on-api-error";

const setupOnApiErrorListenersInjectable = getInjectable({
  id: "setup-on-api-error-listeners",
  setup: async (di) => {
    const apiKube = await di.inject(apiKubeInjectable);

    apiBase?.onError.addListener(onApiError);
    apiKube?.onError.addListener(onApiError);
  },
  instantiate: () => undefined,
});

export default setupOnApiErrorListenersInjectable;
