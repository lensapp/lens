/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubernetesClusterCategory } from "../../common/catalog-entities";
import { isLinux, isWindows } from "../../common/vars";
import { PathPicker } from "../components/path-picker";

interface Dependencies {
  navigateToAddCluster: () => void;
  addSyncEntries: (filePaths: string[]) => void;
  kubernetesClusterCategory: KubernetesClusterCategory;
}

export function initCatalogCategoryRegistryEntries({
  navigateToAddCluster,
  addSyncEntries,
  kubernetesClusterCategory,
} : Dependencies) {
  kubernetesClusterCategory.on("catalogAddMenu", ctx => {
    ctx.menuItems.push(
      {
        icon: "text_snippet",
        title: "Add from kubeconfig",
        onClick: navigateToAddCluster,
      },
    );

    if (isWindows || isLinux) {
      ctx.menuItems.push(
        {
          icon: "create_new_folder",
          title: "Sync kubeconfig folder(s)",
          defaultAction: true,
          onClick: async () => {
            await PathPicker.pick({
              label: "Sync folder(s)",
              buttonLabel: "Sync",
              properties: ["showHiddenFiles", "multiSelections", "openDirectory"],
              onPick: addSyncEntries,
            });
          },
        },
        {
          icon: "note_add",
          title: "Sync kubeconfig file(s)",
          onClick: async () => {
            await PathPicker.pick({
              label: "Sync file(s)",
              buttonLabel: "Sync",
              properties: ["showHiddenFiles", "multiSelections", "openFile"],
              onPick: addSyncEntries,
            });
          },
        },
      );
    } else {
      ctx.menuItems.push(
        {
          icon: "create_new_folder",
          title: "Sync kubeconfig(s)",
          defaultAction: true,
          onClick: async () => {
            await PathPicker.pick({
              label: "Sync file(s)",
              buttonLabel: "Sync",
              properties: ["showHiddenFiles", "multiSelections", "openFile", "openDirectory"],
              onPick: addSyncEntries,
            });
          },
        },
      );
    }
  });
}
