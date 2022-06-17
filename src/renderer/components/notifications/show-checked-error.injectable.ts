/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { JsonApiErrorParsed } from "../../../common/k8s-api/json-api";
import type { ShowCheckedErrorNotification } from "./notifications.store";
import showErrorNotificationInjectable from "./show-error-notification.injectable";

const showCheckedErrorNotificationInjectable = getInjectable({
  id: "show-checked-error-notififcation",
  instantiate: (di): ShowCheckedErrorNotification => {
    const showErrorNotification = di.inject(showErrorNotificationInjectable);

    return (message, fallback, opts) => {
      if (typeof message === "string" || message instanceof Error || message instanceof JsonApiErrorParsed) {
        return showErrorNotification(message, opts);
      }

      console.warn("Unknown notification error message, falling back to default", message);

      return showErrorNotification(fallback, opts);
    };
  },
});

export default showCheckedErrorNotificationInjectable;
