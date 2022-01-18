/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type React from "react";
import { action, observable, makeObservable } from "mobx";
import { autoBind } from "../../utils";
import uniqueId from "lodash/uniqueId";
import type { JsonApiErrorParsed } from "../../../common/k8s-api/json-api";

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
  onClose?(): void; // additional logic on when the notification times out or is closed by the "x"
}

export class NotificationsStore {
  public notifications = observable.array<Notification>([], { deep: false });

  protected autoHideTimers = new Map<NotificationId, number>();

  constructor() {
    makeObservable(this);
    autoBind(this);
  }

  getById(id: NotificationId): Notification | null {
    return this.notifications.find(item => item.id === id) ?? null;
  }

  addAutoHideTimer(id: NotificationId) {
    const notification = this.getById(id);

    if (!notification) return;
    this.removeAutoHideTimer(id);

    if (notification?.timeout) {
      const timer = window.setTimeout(() => this.remove(id), notification.timeout);

      this.autoHideTimers.set(id, timer);
    }
  }

  removeAutoHideTimer(id: NotificationId) {
    if (this.autoHideTimers.has(id)) {
      clearTimeout(this.autoHideTimers.get(id));
      this.autoHideTimers.delete(id);
    }
  }

  @action
  add(notification: Notification): () => void {
    const id = notification.id ?? (
      notification.id = uniqueId("notification_")
    );
    const index = this.notifications.findIndex(item => item.id === id);

    if (index > -1) {
      this.notifications.splice(index, 1, notification); // update existing with same id
    } else {
      this.notifications.push(notification); // add new
    }
    this.addAutoHideTimer(id);

    return () => this.remove(id);
  }

  @action
  remove(id: NotificationId) {
    this.removeAutoHideTimer(id);
    this.notifications.remove(this.getById(id));
  }
}

export const notificationsStore = new NotificationsStore();
