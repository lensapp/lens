/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { clusterSetFrameIdHandler, clusterStates } from "../../common/ipc/cluster";
import type { ClusterId, ClusterState } from "../../common/cluster-types";
import { windowActionHandleChannel, windowLocationChangedChannel, windowOpenAppMenuAsContextMenuChannel, type WindowAction } from "../../common/ipc/window";
import { extensionDiscoveryStateChannel, extensionLoaderFromMainChannel } from "../../common/ipc/extension-handling";
import type { InstalledExtension, LensExtensionId } from "@k8slens/legacy-extensions";
import type { Location } from "history";
import { getLegacyGlobalDiForExtensionApi } from "@k8slens/legacy-global-di";
import ipcRendererInjectable from "../utils/channel/ipc-renderer.injectable";
import { toJS } from "../../common/utils";

async function requestMain(channel: string, ...args: unknown[]): Promise<unknown> {
  const di = getLegacyGlobalDiForExtensionApi();

  const ipcRenderer = di.inject(ipcRendererInjectable);

  return ipcRenderer.invoke(channel, ...args.map(toJS));
}

function emitToMain(channel: string, ...args: unknown[]) {
  const di = getLegacyGlobalDiForExtensionApi();

  const ipcRenderer = di.inject(ipcRendererInjectable);

  return ipcRenderer.send(channel, ...args.map(toJS));
}

export function emitOpenAppMenuAsContextMenu(): void {
  emitToMain(windowOpenAppMenuAsContextMenuChannel);
}

export function emitWindowLocationChanged(location: Location): void {
  emitToMain(windowLocationChangedChannel, location);
}

export async function requestWindowAction(type: WindowAction): Promise<void> {
  await requestMain(windowActionHandleChannel, type);
}

export async function requestSetClusterFrameId(clusterId: ClusterId): Promise<void> {
  await requestMain(clusterSetFrameIdHandler, clusterId);
}

export async function requestInitialClusterStates() {
  return (await requestMain(clusterStates)) as { id: string; state: ClusterState }[];
}

export async function requestInitialExtensionDiscovery() {
  return (await requestMain(extensionDiscoveryStateChannel)) as { isLoaded: boolean };
}

export async function requestExtensionLoaderInitialState() {
  return (await requestMain(extensionLoaderFromMainChannel)) as [LensExtensionId, InstalledExtension][];
}
