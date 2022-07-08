/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import type { NavigateToCatalog } from "../../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";

interface Dependencies {
  extensions: IComputedValue<LensRendererExtension[]>;
  navigateToCatalog: NavigateToCatalog;
}

export const getWelcomeMenuItems = ({
  extensions,
  navigateToCatalog,
}: Dependencies) => {
  const browseClusters = {
    title: "Browse Clusters in Catalog",
    icon: "view_list",

    click: () =>
      navigateToCatalog({
        group: "entity.k8slens.dev",
        kind: "KubernetesCluster",
      }),
  };

  return computed(() => [
    browseClusters,
    ...extensions.get().flatMap((extension) => extension.welcomeMenus),
  ]);
};
