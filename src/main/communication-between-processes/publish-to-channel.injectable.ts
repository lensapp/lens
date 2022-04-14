/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import { getInjectable } from "@ogre-tools/injectable";
import type { IpcMain, IpcRendererEvent, WebContents } from "electron";
import { filter, forEach } from "lodash/fp";
import { publishToChannelInjectionToken } from "../../common/communication-between-processes/publish-to-channel-injection-token";
import ipcMainInjectable from "../app-paths/register-channel/ipc-main/ipc-main.injectable";
import webContentsInjectable from "./web-contents/web-contents.injectable";
import type { Channel } from "../../common/ipc-channel/channel";

const publishToChannelInjectable = getInjectable({
  id: "publish-to-channel",

  instantiate: (di) => {
    const publishInMain = publishInMainFor(di.inject(ipcMainInjectable));
    const publishInRenderer = publishInRendererFor(
      di.inject(webContentsInjectable),
    );

    return (channel, message) => {
      publishInMain(channel, message);

      publishInRenderer(channel, message);
    };
  },

  injectionToken: publishToChannelInjectionToken,
});

export default publishToChannelInjectable;

const publishInMainFor =
  (ipcMain: IpcMain) =>
  <TChannel extends Channel<unknown>>(
      channel: TChannel,
      message: TChannel["_template"],
    ) => {
    const listeners = ipcMain.listeners(channel.name) as ((
      nativeEvent: IpcRendererEvent,
      ...args: any[]
    ) => void)[];

    listeners.forEach((listener) => listener(null, message));
  };

const publishInRendererFor =
  (webContents: typeof WebContents) =>
  <TChannel extends Channel<unknown>>(
      channel: TChannel,
      message: TChannel["_template"],
    ) => {
    pipeline(
      webContents.getAllWebContents(),
      filter((view) => view.isDestroyed() === false),

      (views) => forEach((view) => view.send(channel.name, message), views),
    );
  };
