/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import type { StatefulSet } from "@k8slens/kube-object";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import statefulSetApiInjectable from "../../../common/k8s-api/endpoints/stateful-set.api.injectable";
import type { OpenConfirmDialog } from "../confirm-dialog/open.injectable";
import openConfirmDialogInjectable from "../confirm-dialog/open.injectable";
import type { ShowCheckedErrorNotification } from "../notifications/show-checked-error.injectable";
import showCheckedErrorNotificationInjectable from "../notifications/show-checked-error.injectable";
import type { StatefulSetApi } from "../../../common/k8s-api/endpoints";

export interface StatefulSetMenuProps extends KubeObjectMenuProps<StatefulSet> {}

interface Dependencies {
  statefulSetApi: StatefulSetApi;
  openConfirmDialog: OpenConfirmDialog;
  showCheckedErrorNotification: ShowCheckedErrorNotification;
}

const NonInjectedStatefulSetMenu = ({
  statefulSetApi,
  object,
  toolbar,
  showCheckedErrorNotification,
  openConfirmDialog,
}: Dependencies & StatefulSetMenuProps) => (
  <>
    <MenuItem
      onClick={() => openConfirmDialog({
        ok: async () =>
        {
          try {
            await statefulSetApi.restart({
              namespace: object.getNs(),
              name: object.getName(),
            });
          } catch (err) {
            showCheckedErrorNotification(err, "Unknown error occurred while restarting StatefulSet");
          }
        },
        labelOk: "Restart",
        message: (
          <p>
            {"Are you sure you want to restart StatefulSet "}
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

export const StatefulSetMenu = withInjectables<Dependencies, StatefulSetMenuProps>(NonInjectedStatefulSetMenu, {
  getProps: (di, props) => ({
    ...props,
    showCheckedErrorNotification: di.inject(showCheckedErrorNotificationInjectable),
    statefulSetApi: di.inject(statefulSetApiInjectable),
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
  }),
});
