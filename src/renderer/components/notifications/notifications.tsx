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
import type { Notification, NotificationMessage, NotificationsStore } from "./notifications.store";
import { NotificationStatus } from "./notifications.store";
import { Animate } from "../animate";
import { Icon } from "../icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import { asLegacyGlobalForExtensionApi } from "../../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import notificationsStoreInjectable from "./notifications-store.injectable";

interface Dependencies {
  store: NotificationsStore;
}

@observer
class NonInjectedNotifications extends React.Component<Dependencies> {
  public elem: HTMLDivElement | null = null;

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.store.notifications.length, () => {
        this.scrollToLastNotification();
      }, { delay: 250 }),
    ]);
  }

  scrollToLastNotification() {
    if (!this.elem) {
      return;
    }
    this.elem.scrollTo?.({
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
    const { notifications, remove, addAutoHideTimer, removeAutoHideTimer } = this.props.store;

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
                    data-testid={`close-notification-for-${id}`}
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

export const Notifications = withInjectables<Dependencies>(
  NonInjectedNotifications,

  {
    getProps: (di) => ({
      store: di.inject(notificationsStoreInjectable),
    }),
  },
) as React.FC & {
  ok: (message: NotificationMessage) => () => void;
  checkedError: (message: unknown, fallback: string, customOpts?: Partial<Omit<Notification, "message">>) => () => void;
  error: (message: NotificationMessage, customOpts?: Partial<Omit<Notification, "message">>) => () => void;
  shortInfo: (message: NotificationMessage, customOpts?: Partial<Omit<Notification, "message">>) => () => void;
  info: (message: NotificationMessage, customOpts?: Partial<Omit<Notification, "message">>) => () => void;
};

/**
 * @deprecated
 */
const _notificationStore = asLegacyGlobalForExtensionApi(notificationsStoreInjectable);

Notifications.ok = (message: NotificationMessage) => {
  return _notificationStore.add({
    message,
    timeout: 2_500,
    status: NotificationStatus.OK,
  });
};

Notifications.checkedError = (message, fallback, customOpts = {}) => {
  if (typeof message === "string" || message instanceof Error || message instanceof JsonApiErrorParsed) {
    return Notifications.error(message, customOpts);
  }

  console.warn("Unknown notification error message, falling back to default", message);

  return Notifications.error(fallback, customOpts);
};

Notifications.error = (message, customOpts= {}) => {
  return _notificationStore.add({
    message,
    timeout: 10_000,
    status: NotificationStatus.ERROR,
    ...customOpts,
  });
};

Notifications.shortInfo = (message, customOpts = {}) => {
  return Notifications.info(message, {
    timeout: 5_000,
    ...customOpts,
  });
};

Notifications.info = (message, customOpts = {}) => {
  return _notificationStore.add({
    status: NotificationStatus.INFO,
    timeout: 0,
    message,
    ...customOpts,
  });
};

