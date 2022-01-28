/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { areArgsUpdateAvailableFromMain, UpdateAvailableChannel, onCorrect, UpdateAvailableFromMain, BackchannelArg, ClusterListNamespaceForbiddenChannel, isListNamespaceForbiddenArgs, ListNamespaceForbiddenArgs, HotbarTooManyItems, ipcRendererOn, AutoUpdateChecking, AutoUpdateNoUpdateAvailable } from "../../common/ipc";
import { Notifications, notificationsStore } from "../components/notifications";
import { Button } from "../components/button";
import { isMac } from "../../common/vars";
import { navigate } from "../navigation";
import { entitySettingsURL } from "../../common/routes";
import { defaultHotbarCells } from "../../common/hotbar-store/hotbar-types";
import type { Cluster } from "../../common/cluster/cluster";
import { bind } from "../utils";

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
      },
    },
  );
}

const notificationLastDisplayedAt = new Map<string, number>();
const intervalBetweenNotifications = 1000 * 60; // 60s

interface Dependencies {
  getClusterById: (clusterId: string) => Cluster | null;
}

function ListNamespacesForbiddenHandler({ getClusterById }: Dependencies, event: IpcRendererEvent, ...[clusterId]: ListNamespaceForbiddenArgs): void {
  const lastDisplayedAt = notificationLastDisplayedAt.get(clusterId);
  const now = Date.now();

  if (!notificationLastDisplayedAt.has(clusterId) || (now - lastDisplayedAt) > intervalBetweenNotifications) {
    notificationLastDisplayedAt.set(clusterId, now);
  } else {
    // don't bother the user too often
    return;
  }

  const notificationId = `list-namespaces-forbidden:${clusterId}`;

  if (notificationsStore.getById(notificationId)) {
    // notification is still visible
    return;
  }

  Notifications.info(
    (
      <div className="flex column gaps">
        <b>Add Accessible Namespaces</b>
        <p>
          Cluster <b>{getClusterById(clusterId).name}</b> does not have permissions to list namespaces.{" "}
          Please add the namespaces you have access to.
        </p>
        <div className="flex gaps row align-left box grow">
          <Button
            active
            outlined
            label="Go to Accessible Namespaces Settings"
            onClick={() => {
              navigate(entitySettingsURL({ params: { entityId: clusterId }, fragment: "namespaces" }));
              notificationsStore.remove(notificationId);
            }}
          />
        </div>
      </div>
    ),
    {
      id: notificationId,
      /**
       * Set the time when the notification is closed as well so that there is at
       * least a minute between closing the notification as seeing it again
       */
      onClose: () => notificationLastDisplayedAt.set(clusterId, Date.now()),
    },
  );
}

function HotbarTooManyItemsHandler(): void {
  Notifications.error(`Cannot have more than ${defaultHotbarCells} items pinned to a hotbar`);
}

export function registerIpcListeners({ getClusterById }: Dependencies) {
  onCorrect({
    source: ipcRenderer,
    channel: UpdateAvailableChannel,
    listener: UpdateAvailableHandler,
    verifier: areArgsUpdateAvailableFromMain,
  });
  onCorrect({
    source: ipcRenderer,
    channel: ClusterListNamespaceForbiddenChannel,
    listener: bind(ListNamespacesForbiddenHandler, null, {
      getClusterById,
    }),
    verifier: isListNamespaceForbiddenArgs,
  });
  onCorrect({
    source: ipcRenderer,
    channel: HotbarTooManyItems,
    listener: HotbarTooManyItemsHandler,
    verifier: (args: unknown[]): args is [] => args.length === 0,
  });
  ipcRendererOn(AutoUpdateChecking, () => {
    Notifications.shortInfo("Checking for updates");
  });
  ipcRendererOn(AutoUpdateNoUpdateAvailable, () => {
    Notifications.shortInfo("No update is currently available");
  });
}
