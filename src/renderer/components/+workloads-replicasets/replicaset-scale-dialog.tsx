/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./replicaset-scale-dialog.scss";

import React, { Component } from "react";
import { computed, observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import type { DialogProps } from "../dialog";
import { Dialog } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Icon } from "../icon";
import { Slider } from "../slider";
import { Notifications } from "../notifications";
import { cssNames } from "../../utils";
import type { ReplicaSet, ReplicaSetApi } from "../../../common/k8s-api/endpoints/replica-set.api";
import { replicaSetApi } from "../../../common/k8s-api/endpoints/replica-set.api";

export interface ReplicaSetScaleDialogProps extends Partial<DialogProps> {
  replicaSetApi: ReplicaSetApi;
}

const dialogState = observable.object({
  isOpen: false,
  data: null as ReplicaSet,
});

@observer
export class ReplicaSetScaleDialog extends Component<ReplicaSetScaleDialogProps> {
  static defaultProps = {
    replicaSetApi,
  };

  @observable ready = false;
  @observable currentReplicas = 0;
  @observable desiredReplicas = 0;

  constructor(props: ReplicaSetScaleDialogProps) {
    super(props);
    makeObservable(this);
  }

  static open(replicaSet: ReplicaSet) {
    dialogState.isOpen = true;
    dialogState.data = replicaSet;
  }

  static close() {
    dialogState.isOpen = false;
  }

  get replicaSet() {
    return dialogState.data;
  }

  close = () => {
    ReplicaSetScaleDialog.close();
  };

  onOpen = async () => {
    const { replicaSet } = this;

    this.currentReplicas = await this.props.replicaSetApi.getReplicas({
      namespace: replicaSet.getNs(),
      name: replicaSet.getName(),
    });
    this.desiredReplicas = this.currentReplicas;
    this.ready = true;
  };

  onClose = () => {
    this.ready = false;
  };

  onChange = (evt: React.ChangeEvent, value: number) => {
    this.desiredReplicas = value;
  };

  @computed get scaleMax() {
    const { currentReplicas } = this;
    const defaultMax = 50;

    return currentReplicas <= defaultMax
      ? defaultMax * 2
      : currentReplicas * 2;
  }

  scale = async () => {
    const { replicaSet } = this;
    const { currentReplicas, desiredReplicas, close } = this;

    try {
      if (currentReplicas !== desiredReplicas) {
        await this.props.replicaSetApi.scale({
          name: replicaSet.getName(),
          namespace: replicaSet.getNs(),
        }, desiredReplicas);
      }
      close();
    } catch (err) {
      Notifications.error(err);
    }
  };

  private readonly scaleMin = 0;

  desiredReplicasUp = () => {
    this.desiredReplicas = Math.min(this.scaleMax, this.desiredReplicas + 1);
  };

  desiredReplicasDown = () => {
    this.desiredReplicas = Math.max(this.scaleMin, this.desiredReplicas - 1);
  };

  renderContents() {
    const { currentReplicas, desiredReplicas, onChange, scaleMax } = this;
    const warning = currentReplicas < 10 && desiredReplicas > 90;

    return (
      <>
        <div className="current-scale" data-testid="current-scale">
          Current replica scale: {currentReplicas}
        </div>
        <div className="flex gaps align-center">
          <div className="desired-scale" data-testid="desired-scale">
            Desired number of replicas: {desiredReplicas}
          </div>
          <div className="slider-container flex align-center" data-testid="slider">
            <Slider value={desiredReplicas} max={scaleMax}
              onChange={onChange as any /** see: https://github.com/mui-org/material-ui/issues/20191 */}
            />
          </div>
          <div className="plus-minus-container flex gaps">
            <Icon
              material="add_circle_outline"
              onClick={this.desiredReplicasUp}
              data-testid="desired-replicas-up"
            />
            <Icon
              material="remove_circle_outline"
              onClick={this.desiredReplicasDown}
              data-testid="desired-replicas-down"
            />
          </div>
        </div>
        {warning &&
        <div className="warning" data-testid="warning">
          <Icon material="warning"/>
          High number of replicas may cause cluster performance issues
        </div>
        }
      </>
    );
  }

  render() {
    const { className, ...dialogProps } = this.props;
    const replicaSetName = this.replicaSet ? this.replicaSet.getName() : "";
    const header = (
      <h5>
        Scale Replica Set <span>{replicaSetName}</span>
      </h5>
    );

    return (
      <Dialog
        {...dialogProps}
        isOpen={dialogState.isOpen}
        className={cssNames("ReplicaSetScaleDialog", className)}
        onOpen={this.onOpen}
        onClose={this.onClose}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep
            contentClass="flex gaps column"
            next={this.scale}
            nextLabel="Scale"
            disabledNext={!this.ready}
          >
            {this.renderContents()}
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
