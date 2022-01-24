/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { ipcRenderer, OpenDialogOptions } from "electron";
import { clusterActivateHandler, clusterClearDeletingHandler, clusterDeleteHandler, clusterDisconnectHandler, clusterKubectlApplyAllHandler, clusterKubectlDeleteAllHandler, clusterSetDeletingHandler, clusterSetFrameIdHandler, clusterStates } from "../../common/cluster-ipc";
import type { ClusterId, ClusterState } from "../../common/cluster-types";
import { IpcMainWindowEvents } from "../../common/ipc";
import { openFilePickingDialogChannel } from "../../common/ipc/dialog";
import { extensionDiscoveryStateChannel, extensionLoaderFromMainChannel } from "../../common/ipc/extension-handling";
import type { WindowAction } from "../../common/ipc/window-actions";
import type { InstalledExtension } from "../../extensions/extension-discovery/extension-discovery";
import type { LensExtensionId } from "../../extensions/lens-extension";
import { toJS } from "../utils";

function requestMain(channel: string, ...args: any[]) {
  return ipcRenderer.invoke(channel, ...args.map(toJS));
}

export function requestWindowAction(type: WindowAction): Promise<void> {
  return requestMain(IpcMainWindowEvents.WINDOW_ACTION, type);
}

export function requestOpenFilePickingDialog(opts: OpenDialogOptions): Promise<{ canceled: boolean; filePaths: string[]; }> {
  return requestMain(openFilePickingDialogChannel, opts);
}

export function requestSetClusterFrameId(clusterId: ClusterId): Promise<void> {
  return requestMain(clusterSetFrameIdHandler, clusterId);
}

export function requestClusterActivation(clusterId: ClusterId, force?: boolean): Promise<void> {
  return requestMain(clusterActivateHandler, clusterId, force);
}

export function requestClusterDisconnection(clusterId: ClusterId, force?: boolean): Promise<void> {
  return requestMain(clusterDisconnectHandler, clusterId, force);
}

export function requestSetClusterAsDeleting(clusterId: ClusterId): Promise<void> {
  return requestMain(clusterSetDeletingHandler, clusterId);
}

export function requestClearClusterAsDeleting(clusterId: ClusterId): Promise<void> {
  return requestMain(clusterClearDeletingHandler, clusterId);
}

export function requestDeleteCluster(clusterId: ClusterId): Promise<void> {
  return requestMain(clusterDeleteHandler, clusterId);
}

export function requestInitialClusterStates(): Promise<{ id: string, state: ClusterState }[]> {
  return requestMain(clusterStates);
}

export function requestKubectlApplyAll(clusterId: ClusterId, resources: string[], kubectlArgs: string[]): Promise<{ stderr?: string; stdout?: string }> {
  return requestMain(clusterKubectlApplyAllHandler, clusterId, resources, kubectlArgs);
}

export function requestKubectlDeleteAll(clusterId: ClusterId, resources: string[], kubectlArgs: string[]): Promise<{ stderr?: string; stdout?: string }> {
  return requestMain(clusterKubectlDeleteAllHandler, clusterId, resources, kubectlArgs);
}

export function requestInitialExtensionDiscovery(): Promise<{ isLoaded: boolean }> {
  return requestMain(extensionDiscoveryStateChannel);
}

export function requestExtensionLoaderInitialState(): Promise<[LensExtensionId, InstalledExtension][]> {
  return requestMain(extensionLoaderFromMainChannel);
}
