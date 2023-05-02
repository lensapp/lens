/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import catalogCategoryRegistryInjectable from "../../../common/catalog/category-registry.injectable";
import loadKubeconfigInjectable from "../../../common/cluster/load-kubeconfig.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import getClusterByIdInjectable from "../../../features/cluster/storage/common/get-by-id.injectable";
import openDeleteClusterDialogInjectable from "../../components/delete-cluster-dialog/open.injectable";
import { beforeFrameStartsSecondInjectionToken } from "../tokens";

const setupKubernetesClusterContextMenuOpenInjectable = getInjectable({
  id: "setup-kubernetes-cluster-context-menu-open",
  instantiate: (di) => ({
    run: () => {
      const catalogCategoryRegistry = di.inject(catalogCategoryRegistryInjectable);
      const openDeleteClusterDialog = di.inject(openDeleteClusterDialogInjectable);
      const getClusterById = di.inject(getClusterByIdInjectable);
      const logger = di.inject(loggerInjectionToken);

      catalogCategoryRegistry
        .getForGroupKind("entity.k8slens.dev", "KubernetesCluster")
        ?.on("contextMenuOpen", (entity, context) => {
          if (entity.metadata?.source == "local") {
            context.menuItems.push({
              title: "Remove",
              icon: "delete",
              onClick: async () => {
                const clusterId = entity.getId();
                const cluster = getClusterById(entity.getId());

                if (!cluster) {
                  return logger.warn("[KUBERNETES-CLUSTER]: cannot delete cluster, does not exist in store", { clusterId });
                }

                const loadKubeconfig = di.inject(loadKubeconfigInjectable, cluster);

                const result = await loadKubeconfig(true);

                if (result.error) {
                  logger.error("[KUBERNETES-CLUSTER]: failed to parse kubeconfig file", result.error);
                } else {
                  openDeleteClusterDialog(result.config, cluster);
                }
              },
            });
          }
        });
    },
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default setupKubernetesClusterContextMenuOpenInjectable;
