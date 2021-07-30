/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from "react";
import { MenuItem } from "../menu";
import { ConfirmDialog } from "../confirm-dialog";
import { Notifications } from "../notifications";
import { Icon } from "../icon";
import { WorkloadRollbackDialog } from "./workload-rollback-dialog";
import type { WorkloadKubeObject } from "../../../common/k8s-api/workload-kube-object";
import { apiManager } from "../../../common/k8s-api/api-manager";
import { Deployment, deploymentApi } from "../../../common/k8s-api/endpoints/deployment.api";

interface Props {
  workloadKubeObject: WorkloadKubeObject;
}

export function renderRestart(workloadKubeObject: WorkloadKubeObject) {
  const api: any = apiManager.getApiByKind(workloadKubeObject.kind, workloadKubeObject.apiVersion);

  return (
    <MenuItem onClick={() => ConfirmDialog.open({
      ok: async () => {
        try {
          await api.restart({
            namespace: workloadKubeObject.getNs(),
            name: workloadKubeObject.getName(),
          });
        } catch (err) {
          Notifications.error(err);
        }
      },
      labelOk: `Restart`,
      message: (
        <p>
          Are you sure you want to restart {workloadKubeObject.kind} <b>{workloadKubeObject.getName()}</b>?
        </p>
      ),
    })}>
      <Icon material="autorenew" tooltip="Restart" interactive={true}/>
      <span className="title">Restart</span>
    </MenuItem>
  );
}

export function renderRollback(workloadKubeObject: WorkloadKubeObject) {

  return (
    <MenuItem onClick={() => WorkloadRollbackDialog.open(workloadKubeObject)}>
      <Icon material="history" tooltip="Rollback" interactive={true}/>
      <span className="title">Rollback</span>
    </MenuItem>
  );
}

export function renderPause(workloadKubeObject: Deployment) {

  return (
    <MenuItem onClick={() => ConfirmDialog.open({
      ok: async () => {
        try {
          await deploymentApi.pause({ namespace: workloadKubeObject.getNs(), name: workloadKubeObject.getName() });
        } catch (err) {
          Notifications.error(err);
        }
      },
      labelOk: `Pause`,
      message: (
        <p>
          Pause Deployment <b>{workloadKubeObject.getName()}</b>?
        </p>),
    })}>
      <Icon material="pause_circle_filled" tooltip="Pause" interactive={true}/>
      <span className="title">Pause</span>
    </MenuItem>
  );
}

export function renderResume(workloadKubeObject: Deployment) {

  return (
    <MenuItem onClick={() => ConfirmDialog.open({
      ok: async () => {
        try {
          await deploymentApi.resume({ namespace: workloadKubeObject.getNs(), name: workloadKubeObject.getName() });
        } catch (err) {
          Notifications.error(err);
        }
      },
      labelOk: `Resume`,
      message: (
        <p>
          Resume Deployment <b>{workloadKubeObject.getName()}</b>?
        </p>),
    })}>
      <Icon material="play_circle_outline" tooltip="Resume" interactive={true}/>
      <span className="title">Resume</span>
    </MenuItem>
  );
}

export function pauseResumeMenu(workloadKubeObject: Deployment) {

  return (
    <>
      {!workloadKubeObject.isPaused() ? renderPause(workloadKubeObject) : renderResume(workloadKubeObject)}
    </>
  );
}

export class RolloutMenu extends React.Component<Props> {

  render() {
    const { workloadKubeObject } = this.props;

    if (!workloadKubeObject) {
      return null;
    }

    return (
      <>
        {workloadKubeObject instanceof Deployment && pauseResumeMenu(workloadKubeObject)}
        {renderRestart(workloadKubeObject)}
        {renderRollback(workloadKubeObject)}
      </>
    );
  }
}
