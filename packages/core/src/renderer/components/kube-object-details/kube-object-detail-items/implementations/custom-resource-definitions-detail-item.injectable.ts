/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { computed } from "mobx";
import { CustomResourceDefinitionDetails } from "../../../custom-resource-definitions/details";
import { kubeObjectMatchesToKindAndApiVersion } from "../kube-object-matches-to-kind-and-api-version";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";

const customResourceDefinitionsDetailItemInjectable = getInjectable({
  id: "custom-resource-definitions-detail-item",

  instantiate: (di) => {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: CustomResourceDefinitionDetails,
      enabled: computed(() => isCustomResourceDefinition(kubeObject.value.get()?.object)),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default customResourceDefinitionsDetailItemInjectable;

const isCustomResourceDefinition = kubeObjectMatchesToKindAndApiVersion(
  "CustomResourceDefinition",
  ["apiextensions.k8s.io/v1", "apiextensions.k8s.io/v1beta1"],
);
