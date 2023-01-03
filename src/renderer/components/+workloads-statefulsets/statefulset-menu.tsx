/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import type { StatefulSet, StatefulSetApi } from "../../../common/k8s-api/endpoints";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { Notifications } from "../notifications";
import { withInjectables } from "@ogre-tools/injectable-react";
import statefulSetApiInjectable from "../../../common/k8s-api/endpoints/stateful-set.api.injectable";
import type { OpenConfirmDialog } from "../confirm-dialog/open.injectable";
import openConfirmDialogInjectable from "../confirm-dialog/open.injectable";

export interface StatefulSetMenuProps extends KubeObjectMenuProps<StatefulSet> {}

interface Dependencies {
  statefulsetApi: StatefulSetApi;
  openConfirmDialog: OpenConfirmDialog;
}

const NonInjectedStatefulSetMenu = ({
  statefulsetApi,
  object,
  toolbar,
  openConfirmDialog,
}: Dependencies & StatefulSetMenuProps) => (
  <>
    <MenuItem
      onClick={() => openConfirmDialog({
        ok: async () =>
        {
          try {
            await statefulsetApi.restart({
              namespace: object.getNs(),
              name: object.getName(),
            });
          } catch (err) {
            Notifications.checkedError(err, "Unknown error occured while restarting statefulset");
          }
        },
        labelOk: "Restart",
        message: (
          <p>
            {"Are you sure you want to restart statefulset "}
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
    statefulsetApi: di.inject(statefulSetApiInjectable),
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
  }),
});
