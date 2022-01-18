/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { computed, IComputedValue } from "mobx";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import { navigate } from "../../../navigation";
import { catalogURL } from "../../../../common/routes";

interface Dependencies {
  extensions: IComputedValue<LensRendererExtension[]>;
}

export const getWelcomeMenuItems = ({ extensions }: Dependencies) => {
  const browseClusters = {
    title: "Browse Clusters in Catalog",
    icon: "view_list",
    click: () =>
      navigate(
        catalogURL({
          params: { group: "entity.k8slens.dev", kind: "KubernetesCluster" },
        }),
      ),
  };

  return computed(() => [
    browseClusters,
    ...extensions.get().flatMap((extension) => extension.welcomeMenus),
  ]);
};
