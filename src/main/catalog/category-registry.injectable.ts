/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { CatalogCategoryRegistry } from "../../common/catalog";
import { GeneralCategory, KubernetesClusterCategory, WebLinkCategory } from "../../common/catalog-entities";

const catalogCategoryRegistryInjectable = getInjectable({
  instantiate: () => {
    const registry = new CatalogCategoryRegistry();

    registry.add(new KubernetesClusterCategory());
    registry.add(new GeneralCategory());
    registry.add(new WebLinkCategory());

    return registry;
  },
  lifecycle: lifecycleEnum.singleton,
});

export default catalogCategoryRegistryInjectable;
