/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import catalogEntityRegistryInjectable from "../api/catalog/entity/registry.injectable";
import { computed } from "mobx";
import { isKubernetesCluster } from "../../common/catalog-entities";

const activeKubernetesClusterInjectable = getInjectable({
  id: "active-kubernetes-cluster",

  instantiate: (di) => {
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);

    return computed(() => {
      const activeEntity = catalogEntityRegistry.activeEntity;

      if (!isKubernetesCluster(activeEntity)) {
        return null;
      }

      return activeEntity;
    });
  },
});

export default activeKubernetesClusterInjectable;
