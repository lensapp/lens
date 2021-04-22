import React from "react";
import { ipcRenderer, IpcRendererEvent, shell } from "electron";
import { ClusterStore } from "../../common/cluster-store";
import { InvalidKubeConfigArgs, InvalidKubeconfigChannel } from "../../common/ipc/invalid-kubeconfig";
import { Notifications, notificationsStore } from "../components/notifications";
import { Button } from "../components/button";
import { productName } from "../../common/vars";

export const invalidKubeconfigHandler = {
  source: ipcRenderer,
  channel: InvalidKubeconfigChannel,
  listener: InvalidKubeconfigListener,
  verifier: (args: [unknown]): args is InvalidKubeConfigArgs  => {
    return args.length === 1 && typeof args[0] === "string" && !!ClusterStore.getInstance().getById(args[0]);
  },
};

function InvalidKubeconfigListener(event: IpcRendererEvent, ...[clusterId]: InvalidKubeConfigArgs): void {
  const notificationId = `invalid-kubeconfig:${clusterId}`;
  const cluster = ClusterStore.getInstance().getById(clusterId);
  const contextName = cluster.name !== cluster.contextName ? `(context: ${cluster.contextName})` : "";

  Notifications.error(
    (
      <div className="flex column gaps">
        <b>Cluster with Invalid Kubeconfig Detected!</b>
        <p>Cluster <b>{cluster.name}</b> has invalid kubeconfig {contextName} and cannot be displayed.
        Please fix the <a href="#" onClick={(e) => { e.preventDefault(); shell.showItemInFolder(cluster.kubeConfigPath); }}>kubeconfig</a> manually and restart {productName}
        or remove the cluster.</p>
        <p>Do you want to remove the cluster now?</p>
        <div className="flex gaps row align-left box grow">
          <Button active outlined label="Remove" onClick={()=> {
            ClusterStore.getInstance().removeById(clusterId);
            notificationsStore.remove(notificationId);
          }} />
          <Button active outlined label="Cancel" onClick={() => notificationsStore.remove(notificationId)} />
        </div>
      </div>
    ),
    {
      id: notificationId,
      timeout: 0
    }
  );
}
