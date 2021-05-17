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

import { handleRequest } from "./ipc";
import { ClusterId, ClusterStore } from "./cluster-store";
import { appEventBus } from "./event-bus";
import { ResourceApplier } from "../main/resource-applier";
import { ipcMain, IpcMainInvokeEvent } from "electron";
import { clusterFrameMap } from "./cluster-frames";

export const clusterActivateHandler = "cluster:activate";
export const clusterSetFrameIdHandler = "cluster:set-frame-id";
export const clusterRefreshHandler = "cluster:refresh";
export const clusterDisconnectHandler = "cluster:disconnect";
export const clusterKubectlApplyAllHandler = "cluster:kubectl-apply-all";
export const clusterKubectlDeleteAllHandler = "cluster:kubectl-delete-all";

if (ipcMain) {
  handleRequest(clusterActivateHandler, (event, clusterId: ClusterId, force = false) => {
    const cluster = ClusterStore.getInstance().getById(clusterId);

    if (cluster) {
      return cluster.activate(force);
    }
  });

  handleRequest(clusterSetFrameIdHandler, (event: IpcMainInvokeEvent, clusterId: ClusterId) => {
    const cluster = ClusterStore.getInstance().getById(clusterId);

    if (cluster) {
      clusterFrameMap.set(cluster.id, { frameId: event.frameId, processId: event.processId });

      return cluster.pushState();
    }
  });

  handleRequest(clusterRefreshHandler, (event, clusterId: ClusterId) => {
    const cluster = ClusterStore.getInstance().getById(clusterId);

    if (cluster) return cluster.refresh({ refreshMetadata: true });
  });

  handleRequest(clusterDisconnectHandler, (event, clusterId: ClusterId) => {
    appEventBus.emit({name: "cluster", action: "stop"});
    const cluster = ClusterStore.getInstance().getById(clusterId);

    if (cluster) {
      cluster.disconnect();
      clusterFrameMap.delete(cluster.id);
    }
  });

  handleRequest(clusterKubectlApplyAllHandler, async (event, clusterId: ClusterId, resources: string[], extraArgs: string[]) => {
    appEventBus.emit({name: "cluster", action: "kubectl-apply-all"});
    const cluster = ClusterStore.getInstance().getById(clusterId);

    if (cluster) {
      const applier = new ResourceApplier(cluster);

      try {
        const stdout = await applier.kubectlApplyAll(resources, extraArgs);

        return { stdout };
      } catch (error: any) {
        return { stderr: error };
      }
    } else {
      throw `${clusterId} is not a valid cluster id`;
    }
  });

  handleRequest(clusterKubectlDeleteAllHandler, async (event, clusterId: ClusterId, resources: string[], extraArgs: string[]) => {
    appEventBus.emit({name: "cluster", action: "kubectl-delete-all"});
    const cluster = ClusterStore.getInstance().getById(clusterId);

    if (cluster) {
      const applier = new ResourceApplier(cluster);

      try {
        const stdout = await applier.kubectlDeleteAll(resources, extraArgs);

        return { stdout };
      } catch (error: any) {
        return { stderr: error };
      }
    } else {
      throw `${clusterId} is not a valid cluster id`;
    }
  });
}
