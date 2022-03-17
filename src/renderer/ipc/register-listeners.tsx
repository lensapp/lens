/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { IpcRendererEvent } from "electron";
import { ipcRenderer } from "electron";
import type { UpdateAvailableFromMain, BackchannelArg } from "../../common/ipc";
import { areArgsUpdateAvailableFromMain, UpdateAvailableChannel, onCorrect, ipcRendererOn, AutoUpdateChecking, AutoUpdateNoUpdateAvailable } from "../../common/ipc";
import { Notifications, notificationsStore } from "../components/notifications";
import { Button } from "../components/button";
import { isMac } from "../../common/vars";
import { defaultHotbarCells } from "../../common/hotbar-types";
import { type ListNamespaceForbiddenArgs, clusterListNamespaceForbiddenChannel, isListNamespaceForbiddenArgs } from "../../common/ipc/cluster";
import { hotbarTooManyItemsChannel } from "../../common/ipc/hotbar";

function sendToBackchannel(backchannel: string, notificationId: string, data: BackchannelArg): void {
  notificationsStore.remove(notificationId);
  ipcRenderer.send(backchannel, data);
}

function RenderYesButtons(props: { backchannel: string; notificationId: string }) {
  if (isMac) {
    /**
     * auto-updater's "installOnQuit" is not applicable for macOS as per their docs.
     *
     * See: https://github.com/electron-userland/electron-builder/blob/master/packages/electron-updater/src/AppUpdater.ts#L27-L32
     */
    return (
      <Button
        light
        label="Yes"
        onClick={() => sendToBackchannel(props.backchannel, props.notificationId, { doUpdate: true, now: true })} 
      />
    );
  }

  return (
    <>
      <Button
        light
        label="Yes, now"
        onClick={() => sendToBackchannel(props.backchannel, props.notificationId, { doUpdate: true, now: true })} 
      />
      <Button
        active
        outlined
        label="Yes, later"
        onClick={() => sendToBackchannel(props.backchannel, props.notificationId, { doUpdate: true, now: false })} 
      />
    </>
  );
}

function UpdateAvailableHandler(event: IpcRendererEvent, ...[backchannel, updateInfo]: UpdateAvailableFromMain): void {
  const notificationId = `update-available:${updateInfo.version}`;

  Notifications.info(
    (
      <div className="flex column gaps">
        <b>Update Available</b>
        <p>
          {"Version "}
          {updateInfo.version}
          {" of Lens IDE is available and ready to be installed. Would you like to update now?"}
        </p>
        <p>Lens should restart automatically, if it doesn&apos;t please restart manually. Installed extensions might require updating.</p>
        <div className="flex gaps row align-left box grow">
          <RenderYesButtons backchannel={backchannel} notificationId={notificationId} />
          <Button
            active
            outlined
            label="No"
            onClick={() => sendToBackchannel(backchannel, notificationId, { doUpdate: false })} 
          />
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
  onCorrect({
    source: ipcRenderer,
    channel: UpdateAvailableChannel,
    listener: UpdateAvailableHandler,
    verifier: areArgsUpdateAvailableFromMain,
  });
  onCorrect({
    source: ipcRenderer,
    channel: clusterListNamespaceForbiddenChannel,
    listener: listNamespacesForbiddenHandler,
    verifier: isListNamespaceForbiddenArgs,
  });
  onCorrect({
    source: ipcRenderer,
    channel: hotbarTooManyItemsChannel,
    listener: HotbarTooManyItemsHandler,
    verifier: (args: unknown[]): args is [] => args.length === 0,
  });
  ipcRendererOn(AutoUpdateChecking, () => {
    Notifications.shortInfo("Checking for updates");
  });
  ipcRendererOn(AutoUpdateNoUpdateAvailable, () => {
    Notifications.shortInfo("No update is currently available");
  });
};
