import React from "react";
import { clusterSettingsURL } from "../+cluster-settings";
import { landingURL } from "../+landing-page";

import { clusterStore } from "../../../common/cluster-store";
import { broadcastMessage, requestMain } from "../../../common/ipc";
import { clusterDisconnectHandler } from "../../../common/cluster-ipc";
import { ConfirmDialog } from "../confirm-dialog";
import { Cluster } from "../../../main/cluster";

const navigate = (route: string) =>
  broadcastMessage("renderer:navigate", route);

const deactivateCluster = (clusterId: string) => {
  if (clusterStore.isActive(clusterId)) {
    clusterStore.setActive(null);
  }
  navigate(landingURL());
};

/**
 * Creates handlers for high-level actions
 * that could be performed on an individual cluster
 * @param cluster Cluster
 */
export const ClusterActions = (cluster: Cluster) => ({
  "SHOW_SETTINGS": () => navigate(clusterSettingsURL({
    params: { clusterId: cluster.id }
  })),
  "DISCONNECT": async () => {
    deactivateCluster(cluster.id);
    await requestMain(clusterDisconnectHandler, cluster.id);
  },
  "REMOVE": () => ConfirmDialog.open({
    okButtonProps: {
      primary: false,
      accent: true,
      label: "Remove"
    },
    ok: () => {
      deactivateCluster(cluster.id);
      clusterStore.removeById(cluster.id);
    },
    message: <p>Are you sure want to remove cluster <b title={cluster.id}>{cluster.contextName}</b>?</p>,
  })
});
