/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./cronjob-trigger-dialog.scss";

import React, { Component } from "react";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import type { DialogProps } from "../dialog";
import { Dialog } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import type { CronJob } from "../../../common/k8s-api/endpoints";
import { jobApi } from "../../../common/k8s-api/endpoints";
import { Notifications } from "../notifications";
import { cssNames } from "../../utils";
import { Input } from "../input";
import { systemName, maxLength } from "../input/input_validators";

export interface CronJobTriggerDialogProps extends Partial<DialogProps> {
}

const dialogState = observable.box<CronJob | undefined>();

@observer
export class CronJobTriggerDialog extends Component<CronJobTriggerDialogProps> {
  @observable jobName = "";

  constructor(props: CronJobTriggerDialogProps) {
    super(props);
    makeObservable(this);
  }

  static open(cronjob: CronJob) {
    dialogState.set(cronjob);
  }

  static close() {
    dialogState.set(undefined);
  }

  onOpen = () => {
    const cronJob = dialogState.get();

    this.jobName = cronJob ? `${cronJob.getName()}-manual-${Math.random().toString(36).slice(2, 7)}` : "";
    this.jobName = this.jobName.slice(0, 63);
  };

  async trigger(cronJob: CronJob): Promise<void> {
    if (!cronJob.spec.jobTemplate) {
      return void Notifications.error(`CronJob ${cronJob.getName()} has no jobTemplate`);
    }

    try {
      await jobApi.create({
        name: this.jobName,
        namespace: cronJob.getNs(),
      }, {
        spec: cronJob.spec.jobTemplate.spec,
        metadata: {
          annotations: { "cronjob.kubernetes.io/instantiate": "manual" },
          ownerReferences: [{
            apiVersion: cronJob.apiVersion,
            blockOwnerDeletion: true,
            controller: true,
            kind: cronJob.kind,
            name: cronJob.metadata.name,
            uid: cronJob.metadata.uid,
          }],
        },
      });

      CronJobTriggerDialog.close();
    } catch (err) {
      Notifications.checkedError(err, "Unknown error occurred while creating job");
    }
  }

  renderContents(cronJob: CronJob) {
    return (
      <Wizard
        header={(
          <h5>
            Trigger CronJob
            <span>{cronJob.getName()}</span>
          </h5>
        )}
        done={CronJobTriggerDialog.close}
      >
        <WizardStep
          contentClass="flex gaps column"
          next={() => this.trigger(cronJob)}
          nextLabel="Trigger"
        >
          <div className="flex gaps">
            Job name:
          </div>
          <div className="flex gaps">
            <Input
              required
              autoFocus
              placeholder={this.jobName}
              trim
              validators={[systemName, maxLength]}
              maxLength={63}
              value={this.jobName}
              onChange={v => this.jobName = v.toLowerCase()}
              className="box grow"
            />
          </div>
        </WizardStep>
      </Wizard>
    );
  }

  render() {
    const { className, ...dialogProps } = this.props;
    const cronJob = dialogState.get();

    return (
      <Dialog
        {...dialogProps}
        isOpen={Boolean(cronJob)}
        className={cssNames("CronJobTriggerDialog", className)}
        onOpen={this.onOpen}
        close={CronJobTriggerDialog.close}
      >
        {cronJob && this.renderContents(cronJob)}
      </Dialog>
    );
  }
}
