import React from "react";
import { action, observable } from "mobx"
import { autobind } from "../../utils";
import isObject from "lodash/isObject"
import uniqueId from "lodash/uniqueId";
import { JsonApiErrorParsed } from "../../api/json-api";
import logger from "../../../main/logger";
import { ipcRenderer } from "electron";
import { IpcChannel, NotificationChannelAdd } from "../../../common/ipc";
import { Button, ButtonProps } from "../button";

export type IMessageId = string | number;
export type IMessage = React.ReactNode | React.ReactNode[] | JsonApiErrorParsed;

export enum NotificationStatus {
  OK = "ok",
  ERROR = "error",
  INFO = "info",
}

export interface INotification {
  id?: IMessageId;
  message: IMessage;
  status?: NotificationStatus;
  timeout?: number; // auto-hiding timeout in milliseconds, 0 = no hide
  onClose?(): void; // additonal logic on when the notification times out or is closed by the "x"
}

export interface MainNotification {
  title: string;
  body: string;
  buttons?: ({
    backchannel: IpcChannel;
  } & ButtonProps)[];
  status: NotificationStatus;
  timeout?: number;
  closeChannel?: IpcChannel;
}

function RenderButtons({ id, buttons }: { id: IpcChannel, buttons?: MainNotification["buttons"] }) {
  if (!buttons) {
    return null;
  }

  return (
    <>
      <br />
      <div className="flex row align-right box grow">
        {buttons.map(({ backchannel, ...props}) => (
          <Button {...props} onClick={() => {
            ipcRenderer.send(backchannel);
            notificationsStore.remove(id);
          }} />
        ))}
      </div>
    </>
  )
}

@autobind()
export class NotificationsStore {
  public notifications = observable<INotification>([], { deep: false });

  protected autoHideTimers = new Map<IMessageId, number>();

  registerIpcListener(): void {
    logger.info(`[NOTIFICATION-STORE] start to listen for notifications requests from main`);
    ipcRenderer.on(NotificationChannelAdd, (event, model: MainNotification) => {
      const id = uniqueId("notification_");
      this.add({
        message: (
          <>
            <b>{model.title}</b>
            <p>{model.body}</p>
            <RenderButtons id={id} buttons={model.buttons}/>
          </>
        ),
        id,
        status: model.status,
        timeout: model.timeout,
        onClose: () => {
          model.closeChannel && ipcRenderer.send(model.closeChannel);
        }
      });
    })
  }

  addAutoHideTimer(notification: INotification) {
    this.removeAutoHideTimer(notification);
    const { id, timeout } = notification;
    if (timeout) {
      const timer = window.setTimeout(() => this.remove(id), timeout);
      this.autoHideTimers.set(id, timer);
    }
  }

  removeAutoHideTimer(notification: INotification) {
    const { id } = notification;
    if (this.autoHideTimers.has(id)) {
      clearTimeout(this.autoHideTimers.get(id));
      this.autoHideTimers.delete(id);
    }
  }

  @action
  add(notification: INotification) {
    if (!notification.id) {
      notification.id = uniqueId("notification_");
    }
    const index = this.notifications.findIndex(item => item.id === notification.id);
    if (index > -1) this.notifications.splice(index, 1, notification)
    else this.notifications.push(notification);
    this.addAutoHideTimer(notification);
  }

  @action
  remove(itemOrId: IMessageId | INotification) {
    if (!isObject(itemOrId)) {
      itemOrId = this.notifications.find(item => item.id === itemOrId);
    }
    return this.notifications.remove(itemOrId as INotification);
  }
}

export const notificationsStore = new NotificationsStore();
