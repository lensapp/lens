/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { GeneralCategory, kubernetesClusterCategory, WebLinkCategory } from "../catalog-entities";
import { CatalogCategoryRegistry } from "./category-registry";

const catalogCategoryRegistryInjectable = getInjectable({
  id: "catalog-category-registry",
  instantiate: () => {
    const registry = new CatalogCategoryRegistry();

    // TODO: move to different place
    registry.add(new GeneralCategory());
    registry.add(kubernetesClusterCategory);
    registry.add(new WebLinkCategory());

    return registry;
  },
});

export default catalogCategoryRegistryInjectable;
