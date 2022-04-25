/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { KubeApi } from "../kube-api";
import { KubeObject } from "../kube-object";
import autoRegistrationEmitterInjectable from "./auto-registration-emitter.injectable";
import apiManagerInjectable from "./manager.injectable";
import { CustomResourceStore } from "./resource.store";

const autoRegistrationInjectable = getInjectable({
  id: "api-manager-auto-registration",
  instantiate: (di) => {
    const apiManager = di.inject(apiManagerInjectable);
    const autoRegistrationEmitter = di.inject(autoRegistrationEmitterInjectable);

    autoRegistrationEmitter
      .on("customResourceDefinition", (crd) => {
        const objectConstructor = class extends KubeObject {
          static readonly kind = crd.getResourceKind();
          static readonly namespaced = crd.isNamespaced();
          static readonly apiBase = crd.getResourceApiBase();
        };

        const api = (() => {
          const rawApi = apiManager.getApi(objectConstructor.apiBase);

          if (rawApi) {
            return rawApi;
          }

          const api = new KubeApi({ objectConstructor });

          apiManager.registerApi(api);

          return api;
        })();

        if (!apiManager.getStore(api)) {
          apiManager.registerStore(new CustomResourceStore(api));
        }
      })
      .on("kubeApi", (api) => apiManager.registerApi(api));
  },
});

export default autoRegistrationInjectable;
