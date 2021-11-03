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

import "./cronjob-trigger-dialog.scss";

import React, { Component } from "react";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { CronJob, cronJobApi, jobApi } from "../../../common/k8s-api/endpoints";
import { Notifications } from "../notifications";
import { cssNames } from "../../utils";
import { Input } from "../input";
import { systemName, maxLength } from "../input/input_validators";
import type { KubeObjectMetadata } from "../../../common/k8s-api/kube-object";

interface Props extends Partial<DialogProps> {
}

const dialogState = observable.object({
  isOpen: false,
  data: null as CronJob,
});

@observer
export class CronJobTriggerDialog extends Component<Props> {
  @observable jobName = "";
  @observable ready = false;

  constructor(props: Props) {
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
          ownerReferences: [{
            apiVersion: cronjob.apiVersion,
            blockOwnerDeletion: true,
            controller: true,
            kind: cronjob.kind,
            name: cronjob.metadata.name,
            uid: cronjob.metadata.uid,
          }],
        } as KubeObjectMetadata,
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
