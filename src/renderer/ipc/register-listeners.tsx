/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IpcRendererEvent } from "electron";
import { ipcRenderer } from "electron";
import { Notifications } from "../components/notifications";
import { defaultHotbarCells } from "../../common/hotbars/types";
import { type ListNamespaceForbiddenArgs, clusterListNamespaceForbiddenChannel } from "../../common/ipc/cluster";
import { hotbarTooManyItemsChannel } from "../../common/ipc/hotbar";

function HotbarTooManyItemsHandler(): void {
  Notifications.error(`Cannot have more than ${defaultHotbarCells} items pinned to a hotbar`);
}

interface Dependencies {
  listNamespacesForbiddenHandler: (
    event: IpcRendererEvent,
    ...[clusterId]: ListNamespaceForbiddenArgs
  ) => void;
}

export const registerIpcListeners = ({ listNamespacesForbiddenHandler }: Dependencies) => () => {
  ipcRenderer.on(clusterListNamespaceForbiddenChannel, listNamespacesForbiddenHandler);
  ipcRenderer.on(hotbarTooManyItemsChannel, HotbarTooManyItemsHandler);
};
