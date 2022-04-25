/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/manager.injectable";
import ingressApiInjectable from "../../../common/k8s-api/endpoints/ingress.api.injectable";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";
import { IngressStore } from "./store";

const ingressStoreInjectable = getInjectable({
  id: "ingress-store",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectable), "ingressStore is only available in certain environments");

    const api = di.inject(ingressApiInjectable);

    return new IngressStore(api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default ingressStoreInjectable;
