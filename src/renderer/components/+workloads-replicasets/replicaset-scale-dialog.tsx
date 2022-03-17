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

const dialogState = observable.box<ReplicaSet | undefined>();

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
    dialogState.set(replicaSet);
  }

  static close() {
    dialogState.set(undefined);
  }

  close = () => {
    ReplicaSetScaleDialog.close();
  };

  onOpen = async (replicaSet: ReplicaSet) => {
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

  scale = async (replicaSet: ReplicaSet) => {
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
      Notifications.checkedError(err, "Unknown error occured while scaling ReplicaSet");
    }
  };

  private readonly scaleMin = 0;

  desiredReplicasUp = () => {
    this.desiredReplicas = Math.min(this.scaleMax, this.desiredReplicas + 1);
  };

  desiredReplicasDown = () => {
    this.desiredReplicas = Math.max(this.scaleMin, this.desiredReplicas - 1);
  };

  renderContents(replicaSet: ReplicaSet) {
    const { currentReplicas, desiredReplicas, onChange, scaleMax } = this;
    const warning = currentReplicas < 10 && desiredReplicas > 90;

    return (
      <Wizard
        header={(
          <h5>
            Scale Replica Set
            <span>{replicaSet.getName()}</span>
          </h5>
        )}
        done={this.close}
      >
        <WizardStep
          contentClass="flex gaps column"
          next={() => this.scale(replicaSet)}
          nextLabel="Scale"
          disabledNext={!this.ready}
        >
          <div className="current-scale" data-testid="current-scale">
            {`Current replica scale: ${currentReplicas}`}
          </div>
          <div className="flex gaps align-center">
            <div className="desired-scale" data-testid="desired-scale">
              {`Desired number of replicas: ${desiredReplicas}`}
            </div>
            <div className="slider-container flex align-center" data-testid="slider">
              <Slider
                value={desiredReplicas}
                max={scaleMax}
                onChange={onChange}
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
          {warning && (
            <div className="warning" data-testid="warning">
              <Icon material="warning"/>
              High number of replicas may cause cluster performance issues
            </div>
          )}
        </WizardStep>
      </Wizard>
    );
  }

  render() {
    const { className, ...dialogProps } = this.props;
    const replicaSet = dialogState.get();

    return (
      <Dialog
        {...dialogProps}
        isOpen={Boolean(replicaSet)}
        className={cssNames("ReplicaSetScaleDialog", className)}
        onOpen={replicaSet && (() => this.onOpen(replicaSet))}
        onClose={this.onClose}
        close={this.close}
      >
        {replicaSet && this.renderContents(replicaSet)}
      </Dialog>
    );
  }
}
