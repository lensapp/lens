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

import type React from "react";
import { action, observable, makeObservable } from "mobx";
import { autoBind } from "../../utils";
import uniqueId from "lodash/uniqueId";
import type { JsonApiErrorParsed } from "../../api/json-api";

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
