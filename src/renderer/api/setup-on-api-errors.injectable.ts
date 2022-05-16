/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { apiBase } from "../../common/k8s-api";
import { onApiError } from "./on-api-error";

const setupOnApiErrorListenersInjectable = getInjectable({
  id: "setup-on-api-error-listeners",
  setup: () => {
    apiBase?.onError.addListener(onApiError);
  },
  instantiate: () => undefined,
});

export default setupOnApiErrorListenersInjectable;
