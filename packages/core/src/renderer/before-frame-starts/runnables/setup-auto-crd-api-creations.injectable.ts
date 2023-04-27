/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import { customResourceDefinitionApiInjectionToken } from "../../../common/k8s-api/api-manager/crd-api-token";
import type { CustomResourceDefinition } from "@k8slens/kube-object";
import { KubeApi } from "../../../common/k8s-api/kube-api";
import { KubeObject } from "@k8slens/kube-object";
import maybeKubeApiInjectable from "../../../common/k8s-api/maybe-kube-api.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import { injectableDifferencingRegistratorWith } from "../../../common/utils/registrator-helper";
import customResourceDefinitionStoreInjectable from "../../components/custom-resources/definition.store.injectable";
import { beforeClusterFrameStartsSecondInjectionToken } from "../tokens";

const setupAutoCrdApiCreationsInjectable = getInjectable({
  id: "setup-auto-crd-api-creations",
  instantiate: (di) => ({
    run: () => {
      const customResourceDefinitionStore = di.inject(customResourceDefinitionStoreInjectable);
      const injectableDifferencingRegistrator = injectableDifferencingRegistratorWith(di);

      reaction(
        () => customResourceDefinitionStore.getItems().map(toCrdApiInjectable),
        injectableDifferencingRegistrator,
        {
          fireImmediately: true,
        },
      );
    },
  }),
  injectionToken: beforeClusterFrameStartsSecondInjectionToken,
});

export default setupAutoCrdApiCreationsInjectable;

const toCrdApiInjectable = (crd: CustomResourceDefinition) => getInjectable({
  id: `default-kube-api-for-custom-resource-definition-${crd.getResourceApiBase()}`,
  instantiate: (di) => {
    const objectConstructor = class extends KubeObject {
      static readonly kind = crd.getResourceKind();
      static readonly namespaced = crd.isNamespaced();
      static readonly apiBase = crd.getResourceApiBase();
    };

    return new KubeApi({
      logger: di.inject(loggerInjectable),
      maybeKubeApi: di.inject(maybeKubeApiInjectable),
    }, { objectConstructor });
  },
  injectionToken: customResourceDefinitionApiInjectionToken,
});
