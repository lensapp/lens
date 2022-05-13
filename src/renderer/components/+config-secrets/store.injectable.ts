/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/manager.injectable";
import secretApiInjectable from "../../../common/k8s-api/endpoints/secret.api.injectable";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import { SecretStore } from "./store";

const secretStoreInjectable = getInjectable({
  id: "secret-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectable), "secretStore is only available in certain environments");

    const api = di.inject(secretApiInjectable);

    return new SecretStore(api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default secretStoreInjectable;
