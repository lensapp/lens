/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import autoRegistrationEmitterInjectable from "../../../common/k8s-api/api-manager/auto-registration-emitter.injectable";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/manager.injectable";
import customResourceDefinitionApiInjectable from "../../../common/k8s-api/endpoints/custom-resource-definition.api.injectable";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";
import { CustomResourceDefinitionStore } from "./definition.store";

const customResourceDefinitionStoreInjectable = getInjectable({
  id: "custom-resource-definition-store",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectable), "customResourceDefinitionStore is only available in certain environments");

    const api = di.inject(customResourceDefinitionApiInjectable);

    return new CustomResourceDefinitionStore({
      autoRegistration: di.inject(autoRegistrationEmitterInjectable),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default customResourceDefinitionStoreInjectable;
