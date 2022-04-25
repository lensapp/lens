/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { CustomResourceDefinition } from "../endpoints";
import { KubeApi } from "../kube-api";
import { KubeObject } from "../kube-object";
import autoRegistrationEmitterInjectable from "./auto-registration-emitter.injectable";
import apiManagerInjectable from "./manager.injectable";
import { CustomResourceStore } from "./resource.store";

const autoRegistrationInjectable = getInjectable({
  id: "api-manager-auto-registration",
  instantiate: (di) => {
    const autoRegistrationEmitter = di.inject(autoRegistrationEmitterInjectable);
    const beforeApiManagerInitializationCrds: CustomResourceDefinition[] = [];
    const beforeApiManagerInitializationApis: KubeApi[] = [];
    let initialized = false;

    const autoInitCustomResourceStore = (crd: CustomResourceDefinition) => {
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
    };
    const autoInitKubeApi = (api: KubeApi) => {
      apiManager.registerApi(api);
    };

    autoRegistrationEmitter
      .on("customResourceDefinition", (crd) => {
        if (initialized) {
          autoInitCustomResourceStore(crd);
        } else {
          beforeApiManagerInitializationCrds.push(crd);
        }
      })
      .on("kubeApi", (api) => {
        if (initialized) {
          autoInitKubeApi(api);
        } else {
          beforeApiManagerInitializationApis.push(api);
        }
      });

    const apiManager = di.inject(apiManagerInjectable);

    beforeApiManagerInitializationCrds.forEach(autoInitCustomResourceStore);
    beforeApiManagerInitializationApis.forEach(autoInitKubeApi);
    initialized = true;
  },
});

export default autoRegistrationInjectable;
