/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import navigateToEntitySettingsInjectable from "../../common/front-end-routing/routes/entity-settings/navigate-to-entity-settings.injectable";
import type { ListNamespaceForbiddenArgs } from "../../common/ipc/cluster";
import { Notifications, notificationsStore } from "../components/notifications";
import { ClusterStore } from "../../common/cluster/store";
import { Button } from "../components/button";
import type { IpcRendererEvent } from "electron";
import React from "react";

const listNamespacesForbiddenHandlerInjectable = getInjectable({
  id: "list-namespaces-forbidden-handler",

  instantiate: (di) => {
    const navigateToEntitySettings = di.inject(navigateToEntitySettingsInjectable);

    const notificationLastDisplayedAt = new Map<string, number>();
    const intervalBetweenNotifications = 1000 * 60; // 60s

    return (
      event: IpcRendererEvent,
      ...[clusterId]: ListNamespaceForbiddenArgs
    ): void => {
      const lastDisplayedAt = notificationLastDisplayedAt.get(clusterId);
      const now = Date.now();

      if (
        !notificationLastDisplayedAt.has(clusterId) ||
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

      Notifications.info(
        (
          <div className="flex column gaps">
            <b>Add Accessible Namespaces</b>
            <p>
          Cluster <b>{ClusterStore.getInstance().getById(clusterId).name}</b> does not have permissions to list namespaces.{" "}
          Please add the namespaces you have access to.
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
          onClose: () => notificationLastDisplayedAt.set(clusterId, Date.now()),
        },
      );
    };
  },
});

export default listNamespacesForbiddenHandlerInjectable;
