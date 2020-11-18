import React from "react";
import { action, observable } from "mobx"
import { autobind } from "../../utils";
import isObject from "lodash/isObject"
import uniqueId from "lodash/uniqueId";
import { JsonApiErrorParsed } from "../../api/json-api";

export type NotificationId = string | number;
export type NotificationMessage = React.ReactNode | React.ReactNode[] | JsonApiErrorParsed;

export enum NotificationStatus {
  OK = "ok",
  ERROR = "error",
  INFO = "info",
}

export interface Notification {
  id?: NotificationId;
  message: NotificationMessage;
  status?: NotificationStatus;
  timeout?: number; // auto-hiding timeout in milliseconds, 0 = no hide
}

@autobind()
export class NotificationsStore {
  public notifications = observable<Notification>([], { deep: false });

  protected autoHideTimers = new Map<NotificationId, number>();

  addAutoHideTimer(notification: Notification) {
    this.removeAutoHideTimer(notification);
    const { id, timeout } = notification;
    if (timeout) {
      const timer = window.setTimeout(() => this.remove(id), timeout);
      this.autoHideTimers.set(id, timer);
    }
  }

  removeAutoHideTimer(notification: Notification) {
    const { id } = notification;
    if (this.autoHideTimers.has(id)) {
      clearTimeout(this.autoHideTimers.get(id));
      this.autoHideTimers.delete(id);
    }
  }

  @action
  add(notification: Notification) {
    if (!notification.id) {
      notification.id = uniqueId("notification_");
    }
    const index = this.notifications.findIndex(item => item.id === notification.id);
    if (index > -1) this.notifications.splice(index, 1, notification)
    else this.notifications.push(notification);
    this.addAutoHideTimer(notification);
  }

  @action
  remove(itemOrId: NotificationId | Notification) {
    if (!isObject(itemOrId)) {
      itemOrId = this.notifications.find(item => item.id === itemOrId);
    }
    return this.notifications.remove(itemOrId as Notification);
  }
}

export const notificationsStore = new NotificationsStore();
