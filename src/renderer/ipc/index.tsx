import React from "react";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { areArgsUpdateAvailableFromMain, UpdateAvailableChannel, onCorrect, UpdateAvailableFromMain, BackchannelArg, ClusterListNamespaceForbiddenChannel, isListNamespaceForbiddenArgs, ListNamespaceForbiddenArgs } from "../../common/ipc";
import { Notifications, notificationsStore } from "../components/notifications";
import { Button } from "../components/button";
import { isMac } from "../../common/vars";
import { invalidKubeconfigHandler } from "./invalid-kubeconfig-handler";
import { ClusterStore } from "../../common/cluster-store";
import { navigate } from "../navigation";
import { entitySettingsURL } from "../components/+entity-settings";

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
        <p>Version {updateInfo.version} of Lens IDE is now available. Would you like to update?</p>
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
  } else  {
    // don't bother the user too often
    return;
  }

  const notificationId = `list-namespaces-forbidden:${clusterId}`;

  Notifications.info(
    (
      <div className="flex column gaps">
        <b>Add Accessible Namespaces</b>
        <p>Cluster <b>{ClusterStore.getInstance().active.name}</b> does not have permissions to list namespaces. Please add the namespaces you have access to.</p>
        <div className="flex gaps row align-left box grow">
          <Button active outlined label="Go to Accessible Namespaces Settings" onClick={()=> {
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
  onCorrect(invalidKubeconfigHandler);
  onCorrect({
    source: ipcRenderer,
    channel: ClusterListNamespaceForbiddenChannel,
    listener: ListNamespacesForbiddenHandler,
    verifier: isListNamespaceForbiddenArgs,
  });
}
