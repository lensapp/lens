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
import { ipcRenderer, IpcRendererEvent } from "electron";
import { areArgsUpdateAvailableFromMain, UpdateAvailableChannel, onCorrect, UpdateAvailableFromMain, BackchannelArg, ClusterListNamespaceForbiddenChannel, isListNamespaceForbiddenArgs, ListNamespaceForbiddenArgs } from "../../common/ipc";
import { Notifications, notificationsStore } from "../components/notifications";
import { Button } from "../components/button";
import { isMac } from "../../common/vars";
import { ClusterStore } from "../../common/cluster-store";
import { navigate } from "../navigation";
import { entitySettingsURL } from "../../common/routes";

function sendToBackchannel(backchannel: string, notificationId: string, data: BackchannelArg): void {
  notificationsStore.remove(notificationId);
  ipcRenderer.send(backchannel, data);
}

function RenderYesButtons(props: { backchannel: string, notificationId: string }) {
  if (isMac) {
    /**
     * auto-updater's "installOnQuit" is not applicable for macOS as per their docs.
     *
     * See: https://github.com/electron-userland/electron-builder/blob/master/packages/electron-updater/src/AppUpdater.ts#L27-L32
     */
    return <Button light label="Yes" onClick={() => sendToBackchannel(props.backchannel, props.notificationId, { doUpdate: true, now: true })} />;
  }

  return (
    <>
      <Button light label="Yes, now" onClick={() => sendToBackchannel(props.backchannel, props.notificationId, { doUpdate: true, now: true })} />
      <Button active outlined label="Yes, later" onClick={() => sendToBackchannel(props.backchannel, props.notificationId, { doUpdate: true, now: false })} />
    </>
  );
}

function UpdateAvailableHandler(event: IpcRendererEvent, ...[backchannel, updateInfo]: UpdateAvailableFromMain): void {
  const notificationId = `update-available:${updateInfo.version}`;

  Notifications.info(
    (
      <div className="flex column gaps">
        <b>Update Available</b>
        <p>Version {updateInfo.version} of Lens IDE is available and ready to be installed. Would you like to update now?</p>
        <p>Lens should restart automatically, if it doesn&apos;t please restart manually. Installed extensions might require updating.</p>
        <div className="flex gaps row align-left box grow">
          <RenderYesButtons backchannel={backchannel} notificationId={notificationId} />
          <Button active outlined label="No" onClick={() => sendToBackchannel(backchannel, notificationId, { doUpdate: false })} />
        </div>
      </div>
    ),
    {
      id: notificationId,
      onClose() {
        sendToBackchannel(backchannel, notificationId, { doUpdate: false });
      }
    }
  );
}

const listNamespacesForbiddenHandlerDisplayedAt = new Map<string, number>();
const intervalBetweenNotifications = 1000 * 60; // 60s

function ListNamespacesForbiddenHandler(event: IpcRendererEvent, ...[clusterId]: ListNamespaceForbiddenArgs): void {
  const lastDisplayedAt = listNamespacesForbiddenHandlerDisplayedAt.get(clusterId);
  const wasDisplayed = Boolean(lastDisplayedAt);
  const now = Date.now();

  if (!wasDisplayed || (now - lastDisplayedAt) > intervalBetweenNotifications) {
    listNamespacesForbiddenHandlerDisplayedAt.set(clusterId, now);
  } else {
    // don't bother the user too often
    return;
  }

  const notificationId = `list-namespaces-forbidden:${clusterId}`;

  Notifications.info(
    (
      <div className="flex column gaps">
        <b>Add Accessible Namespaces</b>
        <p>Cluster <b>{ClusterStore.getInstance().getById(clusterId).name}</b> does not have permissions to list namespaces. Please add the namespaces you have access to.</p>
        <div className="flex gaps row align-left box grow">
          <Button active outlined label="Go to Accessible Namespaces Settings" onClick={() => {
            navigate(entitySettingsURL({ params: { entityId: clusterId }, fragment: "accessible-namespaces" }));
            notificationsStore.remove(notificationId);
          }} />
        </div>
      </div>
    ),
    {
      id: notificationId,
    }
  );
}

export function registerIpcHandlers() {
  onCorrect({
    source: ipcRenderer,
    channel: UpdateAvailableChannel,
    listener: UpdateAvailableHandler,
    verifier: areArgsUpdateAvailableFromMain,
  });
  onCorrect({
    source: ipcRenderer,
    channel: ClusterListNamespaceForbiddenChannel,
    listener: ListNamespacesForbiddenHandler,
    verifier: isListNamespaceForbiddenArgs,
  });
}
