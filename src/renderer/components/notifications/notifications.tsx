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

import "./notifications.scss";

import React from "react";
import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { JsonApiErrorParsed } from "../../../common/k8s-api/json-api";
import { cssNames, prevDefault } from "../../utils";
import { Notification, NotificationMessage, notificationsStore, NotificationStatus } from "./notifications.store";
import { Animate } from "../animate";
import { Icon } from "../icon";

@observer
export class Notifications extends React.Component {
  public elem: HTMLElement;

  static ok(message: NotificationMessage) {
    notificationsStore.add({
      message,
      timeout: 2_500,
      status: NotificationStatus.OK,
    });
  }

  static error(message: NotificationMessage, customOpts: Partial<Notification> = {}) {
    notificationsStore.add({
      message,
      timeout: 10_000,
      status: NotificationStatus.ERROR,
      ...customOpts,
    });
  }

  static shortInfo(message: NotificationMessage, customOpts: Partial<Notification> = {}) {
    this.info(message, {
      timeout: 5_000,
      ...customOpts,
    });
  }

  static info(message: NotificationMessage, customOpts: Partial<Notification> = {}) {
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
                onMouseEnter={() => removeAutoHideTimer(id)}>
                <div className="box">
                  <Icon material="info_outline"/>
                </div>
                <div className="message box grow">{msgText}</div>
                <div className="box">
                  <Icon
                    material="close" className="close"
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
