/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import navigateToEntitySettingsInjectable from "../../common/front-end-routing/routes/entity-settings/navigate-to-entity-settings.injectable";
import type { ListNamespaceForbiddenArgs } from "../../common/ipc/cluster";
import { Button } from "@k8slens/button";
import type { IpcRendererEvent } from "electron";
import React from "react";
import { notificationsStoreInjectable, showSuccessNotificationInjectable } from "@k8slens/notifications";
import { getMillisecondsFromUnixEpoch } from "../../common/utils/date/get-current-date-time";
import getClusterByIdInjectable from "../../features/cluster/storage/common/get-by-id.injectable";

const intervalBetweenNotifications = 1000 * 60; // 60s

const listNamespacesForbiddenHandlerInjectable = getInjectable({
  id: "list-namespaces-forbidden-handler",

  instantiate: (di) => {
    const navigateToEntitySettings = di.inject(navigateToEntitySettingsInjectable);
    const notificationsStore = di.inject(notificationsStoreInjectable);
    const getClusterById = di.inject(getClusterByIdInjectable);
    const notificationLastDisplayedAt = new Map<string, number>();
    const showSuccessNotification = di.inject(showSuccessNotificationInjectable);

    return (
      event: IpcRendererEvent,
      ...[clusterId]: ListNamespaceForbiddenArgs
    ): void => {
      const lastDisplayedAt = notificationLastDisplayedAt.get(clusterId);
      const now = getMillisecondsFromUnixEpoch();

      if (
        typeof lastDisplayedAt !== "number" ||
          now - lastDisplayedAt > intervalBetweenNotifications
      ) {
        notificationLastDisplayedAt.set(clusterId, now);
      } else {
        // don't bother the user too often
        return;
      }

      const notificationId = `list-namespaces-forbidden:${clusterId}`;

      if (notificationsStore.getById(notificationId)) {
        // notification is still visible
        return;
      }

      showSuccessNotification(
        (
          <div className="flex column gaps">
            <b>Add Accessible Namespaces</b>
            <p>
              {"Cluster "}
              <b>{getClusterById(clusterId)?.name.get() ?? "<unknown cluster>"}</b>
              {" does not have permissions to list namespaces. Please add the namespaces you have access to."}
            </p>
            <div className="flex gaps row align-left box grow">
              <Button
                active
                outlined
                label="Go to Accessible Namespaces Settings"
                onClick={() => {
                  navigateToEntitySettings(clusterId, "namespaces");
                  notificationsStore.remove(notificationId);
                }}
              />
            </div>
          </div>
        ),
        {
          id: notificationId,
          /**
       * Set the time when the notification is closed as well so that there is at
       * least a minute between closing the notification as seeing it again
       */
          onClose: () => notificationLastDisplayedAt.set(clusterId, getMillisecondsFromUnixEpoch()),
        },
      );
    };
  },
});

export default listNamespacesForbiddenHandlerInjectable;
