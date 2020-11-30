import "./cronjob-trigger-dialog.scss";

import React, { Component } from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { CronJob, cronJobApi, jobApi } from "../../api/endpoints";
import { Notifications } from "../notifications";
import { cssNames } from "../../utils";
import { Input } from "../input";
import { systemName, maxLength } from "../input/input_validators";

interface Props extends Partial<DialogProps> {
}

@observer
export class CronJobTriggerDialog extends Component<Props> {
  @observable static isOpen = false;
  @observable static data: CronJob = null;

  @observable jobName = "";

  @observable ready = false;

  static open(cronjob: CronJob) {
    CronJobTriggerDialog.isOpen = true;
    CronJobTriggerDialog.data = cronjob;
  }

  static close() {
    CronJobTriggerDialog.isOpen = false;
  }

  get cronjob() {
    return CronJobTriggerDialog.data;
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
        namespace: cronjob.getNs()
      });

      await jobApi.create({
        name: this.jobName,
        namespace: cronjob.getNs()
      }, {
        spec: cronjobDefinition.spec.jobTemplate.spec
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
          <Trans>Job name</Trans>:
        </div>
        <div className="flex gaps">
          <Input
            required autoFocus
            placeholder={this.jobName}
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
        <Trans>Trigger CronJob <span>{cronjobName}</span></Trans>
      </h5>
    );
    return (
      <Dialog
        {...dialogProps}
        isOpen={CronJobTriggerDialog.isOpen}
        className={cssNames("CronJobTriggerDialog", className)}
        onOpen={this.onOpen}
        onClose={this.onClose}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep
            contentClass="flex gaps column"
            next={this.trigger}
            nextLabel={<Trans>Trigger</Trans>}
            disabledNext={!this.ready}
          >
            {this.renderContents()}
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}