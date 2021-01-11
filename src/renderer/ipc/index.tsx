import React from "react";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { areArgsUpdateAvailableFromMain, UpdateAvailableChannel, onCorrect, UpdateAvailableFromMain, BackchannelArg } from "../../common/ipc";
import { Notifications, notificationsStore } from "../components/notifications";
import { Button, ButtonPannel } from "../components/button";
import { isMac } from "../../common/vars";
import * as uuid from "uuid";

function UpdateAvailableHandler(event: IpcRendererEvent, ...[backchannel, updateInfo]: UpdateAvailableFromMain): void {
  const notificationId = uuid.v4();

  function sendToBackchannel(data: BackchannelArg): void {
    notificationsStore.remove(notificationId);
    console.log("sending to backchanel", { backchannel, data });
    ipcRenderer.send(backchannel, data);
  }

  function renderYesButtons() {
    if (isMac) {
      /**
       * auto-updater's "installOnQuit" is not applicable for macOS as per their docs.
       *
       * See: https://github.com/electron-userland/electron-builder/blob/master/packages/electron-updater/src/AppUpdater.ts#L27-L32
       */
      return <Button light label="Yes" onClick={() => sendToBackchannel({ doUpdate: true, now: true })} />;
    }

    return (
      <>
        <Button light label="Yes, now" onClick={() => sendToBackchannel({ doUpdate: true, now: true })} />
        <Button primary outlined label="Yes, later" onClick={() => sendToBackchannel({ doUpdate: true, now: false })} />
      </>
    );
  }

  Notifications.info(
    (
      <>
        <b>Update Available</b>
        <p>Version {updateInfo.version} of Lens IDE is now available. Would you like to update?</p>
        <ButtonPannel>
          {renderYesButtons()}
          <Button primary outlined label="No" onClick={() => sendToBackchannel({ doUpdate: false })} />
        </ButtonPannel>
      </>
    ), {
      id: notificationId,
      onClose() {
        sendToBackchannel({ doUpdate: false });
      }
    }
  );
}

export function registerIpcHandlers() {
  onCorrect(ipcRenderer, UpdateAvailableChannel, UpdateAvailableHandler, areArgsUpdateAvailableFromMain);
}
