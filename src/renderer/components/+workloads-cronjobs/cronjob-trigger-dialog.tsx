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
import { cronJobApi, jobApi } from "../../../common/k8s-api/endpoints";
import { Notifications } from "../notifications";
import { cssNames } from "../../utils";
import { Input } from "../input";
import { systemName, maxLength } from "../input/input_validators";

export interface CronJobTriggerDialogProps extends Partial<DialogProps> {
}

const dialogState = observable.object({
  isOpen: false,
  data: null as CronJob,
});

@observer
export class CronJobTriggerDialog extends Component<CronJobTriggerDialogProps> {
  @observable jobName = "";
  @observable ready = false;

  constructor(props: CronJobTriggerDialogProps) {
    super(props);
    makeObservable(this);
  }

  static open(cronjob: CronJob) {
    dialogState.isOpen = true;
    dialogState.data = cronjob;
  }

  static close() {
    dialogState.isOpen = false;
  }

  get cronjob() {
    return dialogState.data;
  }

  close = () => {
    CronJobTriggerDialog.close();
  };

  onOpen = async () => {
    const { cronjob } = this;

    this.jobName = cronjob ? `${cronjob.getName()}-manual-${Math.random().toString(36).slice(2, 7)}` : "";
    this.jobName = this.jobName.slice(0, 63);
    this.ready = true;
  };

  onClose = () => {
    this.ready = false;
  };

  trigger = async () => {
    const { cronjob } = this;
    const { close } = this;

    try {
      const cronjobDefinition = await cronJobApi.get({
        name: cronjob.getName(),
        namespace: cronjob.getNs(),
      });

      await jobApi.create({
        name: this.jobName,
        namespace: cronjob.getNs(),
      }, {
        spec: cronjobDefinition.spec.jobTemplate.spec,
        metadata: {
          annotations: { "cronjob.kubernetes.io/instantiate": "manual" },
          ownerReferences: [{
            apiVersion: cronjob.apiVersion,
            blockOwnerDeletion: true,
            controller: true,
            kind: cronjob.kind,
            name: cronjob.metadata.name,
            uid: cronjob.metadata.uid,
          }],
        },
      });

      close();
    } catch (err) {
      Notifications.error(err);
    }
  };

  renderContents() {
    return (
      <>
        <div className="flex gaps">
          Job name:
        </div>
        <div className="flex gaps">
          <Input
            required autoFocus
            placeholder={this.jobName}
            trim
            validators={[systemName, maxLength]}
            maxLength={63}
            value={this.jobName} onChange={v => this.jobName = v.toLowerCase()}
            className="box grow"
          />
        </div>
      </>
    );
  }

  render() {
    const { className, ...dialogProps } = this.props;
    const cronjobName = this.cronjob ? this.cronjob.getName() : "";
    const header = (
      <h5>
        Trigger CronJob <span>{cronjobName}</span>
      </h5>
    );

    return (
      <Dialog
        {...dialogProps}
        isOpen={dialogState.isOpen}
        className={cssNames("CronJobTriggerDialog", className)}
        onOpen={this.onOpen}
        onClose={this.onClose}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep
            contentClass="flex gaps column"
            next={this.trigger}
            nextLabel="Trigger"
            disabledNext={!this.ready}
          >
            {this.renderContents()}
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
