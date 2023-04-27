/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import type { DaemonSet } from "@k8slens/kube-object";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import daemonSetApiInjectable from "../../../common/k8s-api/endpoints/daemon-set.api.injectable";
import type { OpenConfirmDialog } from "../confirm-dialog/open.injectable";
import openConfirmDialogInjectable from "../confirm-dialog/open.injectable";
import type { ShowCheckedErrorNotification } from "../notifications/show-checked-error.injectable";
import showCheckedErrorNotificationInjectable from "../notifications/show-checked-error.injectable";
import type { DaemonSetApi } from "../../../common/k8s-api/endpoints";

export interface DaemonSetMenuProps extends KubeObjectMenuProps<DaemonSet> {}

interface Dependencies {
  daemonSetApi: DaemonSetApi;
  openConfirmDialog: OpenConfirmDialog;
  showCheckedErrorNotification: ShowCheckedErrorNotification;
}

const NonInjectedDaemonSetMenu = ({
  daemonSetApi,
  object,
  toolbar,
  openConfirmDialog,
  showCheckedErrorNotification,
}: Dependencies & DaemonSetMenuProps) => (
  <>
    <MenuItem
      onClick={() => openConfirmDialog({
        ok: async () =>
        {
          try {
            await daemonSetApi.restart({
              namespace: object.getNs(),
              name: object.getName(),
            });
          } catch (err) {
            showCheckedErrorNotification(err, "Unknown error occurred while restarting DaemonSet");
          }
        },
        labelOk: "Restart",
        message: (
          <p>
            {"Are you sure you want to restart DaemonSet "}
            <b>{object.getName()}</b>
            ?
          </p>
        ),
      })}
    >
      <Icon
        material="autorenew"
        tooltip="Restart"
        interactive={toolbar}
      />
      <span className="title">Restart</span>
    </MenuItem>
  </>
);

export const DaemonSetMenu = withInjectables<Dependencies, DaemonSetMenuProps>(NonInjectedDaemonSetMenu, {
  getProps: (di, props) => ({
    ...props,
    daemonSetApi: di.inject(daemonSetApiInjectable),
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
    showCheckedErrorNotification: di.inject(showCheckedErrorNotificationInjectable),
  }),
});
