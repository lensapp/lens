/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import type { CronJob } from "@k8slens/kube-object";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import type { OpenConfirmDialog } from "../confirm-dialog/open.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import openConfirmDialogInjectable from "../confirm-dialog/open.injectable";
import type { OpenCronJobTriggerDialog } from "./trigger-dialog/open.injectable";
import openCronJobTriggerDialogInjectable from "./trigger-dialog/open.injectable";
import cronJobApiInjectable from "../../../common/k8s-api/endpoints/cron-job.api.injectable";
import type { ShowCheckedErrorNotification } from "../notifications/show-checked-error.injectable";
import showCheckedErrorNotificationInjectable from "../notifications/show-checked-error.injectable";
import type { CronJobApi } from "../../../common/k8s-api/endpoints";

export interface CronJobMenuProps extends KubeObjectMenuProps<CronJob> {}

interface Dependencies {
  openConfirmDialog: OpenConfirmDialog;
  openCronJobTriggerDialog: OpenCronJobTriggerDialog;
  cronJobApi: CronJobApi;
  showCheckedErrorNotification: ShowCheckedErrorNotification;
}

const NonInjectedCronJobMenu = ({
  object,
  toolbar,
  openConfirmDialog,
  openCronJobTriggerDialog,
  cronJobApi,
  showCheckedErrorNotification,
}: Dependencies & CronJobMenuProps) =>  (
  <>
    <MenuItem onClick={() => openCronJobTriggerDialog(object)}>
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
          onClick={() => openConfirmDialog({
            ok: async () => {
              try {
                await cronJobApi.resume({ namespace: object.getNs(), name: object.getName() });
              } catch (err) {
                showCheckedErrorNotification(err, "Unknown error occurred while resuming CronJob");
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
          onClick={() => openConfirmDialog({
            ok: async () => {
              try {
                await cronJobApi.suspend({ namespace: object.getNs(), name: object.getName() });
              } catch (err) {
                showCheckedErrorNotification(err, "Unknown error occurred while suspending CronJob");
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

export const CronJobMenu = withInjectables<Dependencies, CronJobMenuProps>(NonInjectedCronJobMenu, {
  getProps: (di, props) => ({
    ...props,
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
    openCronJobTriggerDialog: di.inject(openCronJobTriggerDialogInjectable),
    cronJobApi: di.inject(cronJobApiInjectable),
    showCheckedErrorNotification: di.inject(showCheckedErrorNotificationInjectable),
  }),
});
