/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import React, { Component } from "react";
import type { IObservableValue } from "mobx";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import type { DialogProps } from "../../dialog";
import { Dialog } from "../../dialog";
import { Wizard, WizardStep } from "../../wizard";
import type { CronJob } from "@k8slens/kube-object";
import type { ShowNotification } from "../../notifications";
import { cssNames } from "@k8slens/utilities";
import { Input } from "../../input";
import { systemName, maxLength } from "../../input/input_validators";
import { withInjectables } from "@ogre-tools/injectable-react";
import closeCronJobTriggerDialogInjectable from "./close.injectable";
import jobApiInjectable from "../../../../common/k8s-api/endpoints/job.api.injectable";
import cronJobTriggerDialogStateInjectable from "./state.injectable";
import type { ShowCheckedErrorNotification } from "../../notifications/show-checked-error.injectable";
import showCheckedErrorNotificationInjectable from "../../notifications/show-checked-error.injectable";
import showErrorNotificationInjectable from "../../notifications/show-error-notification.injectable";
import type { JobApi } from "../../../../common/k8s-api/endpoints";

export interface CronJobTriggerDialogProps extends Partial<DialogProps> {
}

interface Dependencies {
  state: IObservableValue<CronJob | undefined>;
  jobApi: JobApi;
  closeCronJobTriggerDialog: () => void;
  showCheckedErrorNotification: ShowCheckedErrorNotification;
  showErrorNotification: ShowNotification;
}

@observer
class NonInjectedCronJobTriggerDialog extends Component<CronJobTriggerDialogProps & Dependencies> {
  @observable jobName = "";

  constructor(props: CronJobTriggerDialogProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  onOpen = () => {
    const cronJob = this.props.state.get();

    this.jobName = cronJob ? `${cronJob.getName()}-manual-${Math.random().toString(36).slice(2, 7)}` : "";
    this.jobName = this.jobName.slice(0, 63);
  };

  async trigger(cronJob: CronJob): Promise<void> {
    if (!cronJob.spec.jobTemplate) {
      this.props.showErrorNotification(`CronJob ${cronJob.getName()} has no jobTemplate`);

      return;
    }

    try {
      await this.props.jobApi.create({
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

      this.props.closeCronJobTriggerDialog();
    } catch (err) {
      this.props.showCheckedErrorNotification(err, "Unknown error occurred while creating job");
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
        done={this.props.closeCronJobTriggerDialog}
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
    const { className, state, closeCronJobTriggerDialog, jobApi, ...dialogProps } = this.props;
    const cronJob = state.get();

    void jobApi;

    return (
      <Dialog
        {...dialogProps}
        isOpen={Boolean(cronJob)}
        className={cssNames("CronJobTriggerDialog", className)}
        onOpen={this.onOpen}
        close={closeCronJobTriggerDialog}
      >
        {cronJob && this.renderContents(cronJob)}
      </Dialog>
    );
  }
}

export const CronJobTriggerDialog = withInjectables<Dependencies, CronJobTriggerDialogProps>(NonInjectedCronJobTriggerDialog, {
  getProps: (di, props) => ({
    ...props,
    closeCronJobTriggerDialog: di.inject(closeCronJobTriggerDialogInjectable),
    jobApi: di.inject(jobApiInjectable),
    state: di.inject(cronJobTriggerDialogStateInjectable),
    showCheckedErrorNotification: di.inject(showCheckedErrorNotificationInjectable),
    showErrorNotification: di.inject(showErrorNotificationInjectable),
  }),
});
