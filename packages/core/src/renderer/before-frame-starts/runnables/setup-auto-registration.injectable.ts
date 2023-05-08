/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import autoRegistrationEmitterInjectable from "../../../common/k8s-api/api-manager/auto-registration-emitter.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import type { KubeApi } from "@k8slens/kube-api";
import { beforeClusterFrameStartsSecondInjectionToken } from "../tokens";

const setupAutoRegistrationInjectable = getInjectable({
  id: "setup-auto-registration",
  instantiate: (di) => ({
    run: () => {
      const autoRegistrationEmitter = di.inject(autoRegistrationEmitterInjectable);
      const beforeApiManagerInitializationApis: KubeApi[] = [];
      let initialized = false;

      const autoInitKubeApi = (api: KubeApi) => {
        apiManager.registerApi(api);
      };

      autoRegistrationEmitter
        .on("kubeApi", (api) => {
          if (initialized) {
            autoInitKubeApi(api);
          } else {
            beforeApiManagerInitializationApis.push(api);
          }
        });

      // NOTE: this MUST happen after the event emitter listeners are registered
      const apiManager = di.inject(apiManagerInjectable);

      beforeApiManagerInitializationApis.forEach(autoInitKubeApi);
      initialized = true;
    },
  }),
  injectionToken: beforeClusterFrameStartsSecondInjectionToken,
});

export default setupAutoRegistrationInjectable;
