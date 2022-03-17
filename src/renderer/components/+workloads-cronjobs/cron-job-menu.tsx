/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import type { CronJob } from "../../../common/k8s-api/endpoints";
import { cronJobApi } from "../../../common/k8s-api/endpoints";
import { MenuItem } from "../menu";
import { CronJobTriggerDialog } from "./cronjob-trigger-dialog";
import { Icon } from "../icon";
import { ConfirmDialog } from "../confirm-dialog";
import { Notifications } from "../notifications";

export function CronJobMenu(props: KubeObjectMenuProps<CronJob>) {
  const { object, toolbar } = props;

  return (
    <>
      <MenuItem onClick={() => CronJobTriggerDialog.open(object)}>
        <Icon
          material="play_circle_filled"
          tooltip="Trigger"
          interactive={toolbar}
        />
        <span className="title">Trigger</span>
      </MenuItem>

      {object.isSuspend()
        ? (
          <MenuItem
            onClick={() => ConfirmDialog.open({
              ok: async () => {
                try {
                  await cronJobApi.resume({ namespace: object.getNs(), name: object.getName() });
                } catch (err) {
                  Notifications.checkedError(err, "Unknown error occured while resuming CronJob");
                }
              },
              labelOk: `Resume`,
              message: (
                <p>
                  {"Resume CronJob "}
                  <b>{object.getName()}</b>
                  ?
                </p>
              ),
            })}
          >
            <Icon
              material="play_circle_outline"
              tooltip="Resume"
              interactive={toolbar}
            />
            <span className="title">Resume</span>
          </MenuItem>
        )
        : (
          <MenuItem
            onClick={() => ConfirmDialog.open({
              ok: async () => {
                try {
                  await cronJobApi.suspend({ namespace: object.getNs(), name: object.getName() });
                } catch (err) {
                  Notifications.checkedError(err, "Unknown error occured while suspending CronJob");
                }
              },
              labelOk: `Suspend`,
              message: (
                <p>
                  {"Suspend CronJob "}
                  <b>{object.getName()}</b>
                  ?
                </p>),
            })}
          >
            <Icon
              material="pause_circle_filled"
              tooltip="Suspend"
              interactive={toolbar}
            />
            <span className="title">Suspend</span>
          </MenuItem>
        )
      }
    </>
  );
}
