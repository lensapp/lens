/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { KubernetesClusterCategory } from "../../catalog-entities/kubernetes-cluster";
import { builtInCategoryInjectionToken } from "../../../common/catalog/category-registry.injectable";

const kubernetesClusterCategoryInjectable = getInjectable({
  id: "kubernetes-cluster-category-main",
  instantiate: () => new KubernetesClusterCategory(),
  injectionToken: builtInCategoryInjectionToken,
});

export default kubernetesClusterCategoryInjectable;
