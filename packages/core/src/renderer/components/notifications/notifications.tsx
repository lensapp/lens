/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./notifications.scss";

import React from "react";
import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { JsonApiErrorParsed } from "../../../common/k8s-api/json-api";
import type { Disposer } from "../../utils";
import { cssNames, prevDefault } from "../../utils";
import type { CreateNotificationOptions, Notification, NotificationMessage, NotificationsStore } from "./notifications.store";
import { Animate } from "../animate";
import { Icon } from "../icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import notificationsStoreInjectable from "./notifications-store.injectable";
import { asLegacyGlobalFunctionForExtensionApi } from "../../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";
import showSuccessNotificationInjectable from "./show-success-notification.injectable";
import type { ShowCheckedErrorNotification } from "./show-checked-error.injectable";
import showCheckedErrorNotificationInjectable from "./show-checked-error.injectable";
import showErrorNotificationInjectable from "./show-error-notification.injectable";
import showInfoNotificationInjectable from "./show-info-notification.injectable";
import showShortInfoNotificationInjectable from "./show-short-info.injectable";

export type ShowNotification = (message: NotificationMessage, opts?: CreateNotificationOptions) => Disposer;

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
  ok: ShowNotification;
  checkedError: ShowCheckedErrorNotification;
  error: ShowNotification;
  shortInfo: ShowNotification;
  info: ShowNotification;
};

Notifications.ok = asLegacyGlobalFunctionForExtensionApi(showSuccessNotificationInjectable);
Notifications.error = asLegacyGlobalFunctionForExtensionApi(showErrorNotificationInjectable);
Notifications.checkedError = asLegacyGlobalFunctionForExtensionApi(showCheckedErrorNotificationInjectable);
Notifications.info = asLegacyGlobalFunctionForExtensionApi(showInfoNotificationInjectable);
Notifications.shortInfo = asLegacyGlobalFunctionForExtensionApi(showShortInfoNotificationInjectable);

