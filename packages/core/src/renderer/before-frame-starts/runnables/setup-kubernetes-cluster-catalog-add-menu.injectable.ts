/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import kubernetesClusterCategoryInjectable from "../../../common/catalog/categories/kubernetes-cluster.injectable";
import navigateToAddClusterInjectable from "../../../common/front-end-routing/routes/add-cluster/navigate-to-add-cluster.injectable";
import isLinuxInjectable from "../../../common/vars/is-linux.injectable";
import isWindowsInjectable from "../../../common/vars/is-windows.injectable";
import openPathPickingDialogInjectable from "../../../features/path-picking-dialog/renderer/pick-paths.injectable";
import addSyncEntriesInjectable from "../../initializers/add-sync-entries.injectable";
import { beforeFrameStartsSecondInjectionToken } from "../tokens";

const setupKubernetesClusterCatalogAddMenuListenerInjectable = getInjectable({
  id: "setup-kubernetes-cluster-catalog-add-menu-listener",
  instantiate: (di) => ({
    run: () => {
      const navigateToAddCluster = di.inject(navigateToAddClusterInjectable);
      const addSyncEntries = di.inject(addSyncEntriesInjectable);
      const kubernetesClusterCategory = di.inject(kubernetesClusterCategoryInjectable);
      const isWindows = di.inject(isWindowsInjectable);
      const isLinux = di.inject(isLinuxInjectable);
      const openPathPickingDialog = di.inject(openPathPickingDialogInjectable);

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
              onClick: () => openPathPickingDialog({
                message: "Sync folder(s)",
                buttonLabel: "Sync",
                properties: ["showHiddenFiles", "multiSelections", "openDirectory"],
                onPick: addSyncEntries,
              }),
            },
            {
              icon: "note_add",
              title: "Sync kubeconfig file(s)",
              onClick: () => openPathPickingDialog({
                message: "Sync file(s)",
                buttonLabel: "Sync",
                properties: ["showHiddenFiles", "multiSelections", "openFile"],
                onPick: addSyncEntries,
              }),
            },
          );
        } else {
          ctx.menuItems.push(
            {
              icon: "create_new_folder",
              title: "Sync kubeconfig(s)",
              defaultAction: true,
              onClick: () => openPathPickingDialog({
                message: "Sync file(s)",
                buttonLabel: "Sync",
                properties: ["showHiddenFiles", "multiSelections", "openFile", "openDirectory"],
                onPick: addSyncEntries,
              }),
            },
          );
        }
      });
    },
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default setupKubernetesClusterCatalogAddMenuListenerInjectable;
