/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./notifications.scss";

import React from "react";
import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { JsonApiErrorParsed } from "../../../common/k8s-api/json-api";
import { cssNames, prevDefault } from "../../utils";
import type { Notification, NotificationMessage } from "./notifications.store";
import { notificationsStore, NotificationStatus } from "./notifications.store";
import { Animate } from "../animate";
import { Icon } from "../icon";

@observer
export class Notifications extends React.Component {
  public elem: HTMLDivElement | null = null;

  static ok(message: NotificationMessage) {
    return notificationsStore.add({
      message,
      timeout: 2_500,
      status: NotificationStatus.OK,
    });
  }

  static checkedError(message: unknown, fallback: string, customOpts?: Partial<Omit<Notification, "message">>) {
    if (typeof message === "string" || message instanceof Error || message instanceof JsonApiErrorParsed) {
      return Notifications.error(message, customOpts);
    }

    console.warn("Unknown notification error message, falling back to default", message);

    return Notifications.error(fallback, customOpts);
  }

  static error(message: NotificationMessage, customOpts: Partial<Omit<Notification, "message">> = {}) {
    return notificationsStore.add({
      message,
      timeout: 10_000,
      status: NotificationStatus.ERROR,
      ...customOpts,
    });
  }

  static shortInfo(message: NotificationMessage, customOpts: Partial<Omit<Notification, "message">> = {}) {
    return this.info(message, {
      timeout: 5_000,
      ...customOpts,
    });
  }

  static info(message: NotificationMessage, customOpts: Partial<Omit<Notification, "message">> = {}) {
    return notificationsStore.add({
      status: NotificationStatus.INFO,
      timeout: 0,
      message,
      ...customOpts,
    });
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => notificationsStore.notifications.length, () => {
        this.scrollToLastNotification();
      }, { delay: 250 }),
    ]);
  }

  scrollToLastNotification() {
    if (!this.elem) {
      return;
    }
    this.elem.scrollTo({
      top: this.elem.scrollHeight,
      behavior: "smooth",
    });
  }

  getMessage(notification: Notification) {
    let { message } = notification;

    if (message instanceof JsonApiErrorParsed || message instanceof Error) {
      message = message.toString();
    }

    return React.Children.toArray(message);
  }

  render() {
    const { notifications, remove, addAutoHideTimer, removeAutoHideTimer } = notificationsStore;

    return (
      <div className="Notifications flex column align-flex-end" ref={e => this.elem = e}>
        {notifications.map(notification => {
          const { id, status, onClose } = notification;
          const msgText = this.getMessage(notification);

          return (
            <Animate key={id}>
              <div
                className={cssNames("notification flex", status)}
                onMouseLeave={() => addAutoHideTimer(id)}
                onMouseEnter={() => removeAutoHideTimer(id)}
              >
                <div className="box">
                  <Icon material="info_outline" />
                </div>
                <div className="message box grow">{msgText}</div>
                <div className="box">
                  <Icon
                    material="close"
                    className="close"
                    onClick={prevDefault(() => {
                      remove(id);
                      onClose?.();
                    })}
                  />
                </div>
              </div>
            </Animate>
          );
        })}
      </div>
    );
  }
}
