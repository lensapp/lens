/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { defaultHotbarCells } from "../../../../common/hotbars/types";
import showErrorNotificationInjectable from "../../../../renderer/components/notifications/show-error-notification.injectable";
import { onTooManyHotbarItemsInjectionToken } from "../common/on-too-many-items";

const onTooManyHotbarItemsInjectable = getInjectable({
  id: "on-too-many-hotbar-items",
  instantiate: (di) => {
    const showErrorNotification = di.inject(showErrorNotificationInjectable);

    return () => showErrorNotification(`Cannot have more than ${defaultHotbarCells} items pinned to a hotbar`);
  },
  injectionToken: onTooManyHotbarItemsInjectionToken,
});

export default onTooManyHotbarItemsInjectable;
