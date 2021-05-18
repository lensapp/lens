/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
