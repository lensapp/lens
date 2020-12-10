import "./replicaset-scale-dialog.scss";

import React, { Component } from "react";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Icon } from "../icon";
import { Slider } from "../slider";
import { Notifications } from "../notifications";
import { cssNames } from "../../utils";
import { ReplicaSet, replicaSetApi } from "../../api/endpoints/replica-set.api";

interface Props extends Partial<DialogProps> {
}

@observer
export class ReplicaSetScaleDialog extends Component<Props> {
  @observable static isOpen = false;
  @observable static data: ReplicaSet = null;

  @observable ready = false;
  @observable currentReplicas = 0;
  @observable desiredReplicas = 0;

  static open(replicaSet: ReplicaSet) {
    ReplicaSetScaleDialog.isOpen = true;
    ReplicaSetScaleDialog.data = replicaSet;
  }

  static close() {
    ReplicaSetScaleDialog.isOpen = false;
  }

  get replicaSet() {
    return ReplicaSetScaleDialog.data;
  }

  close = () => {
    ReplicaSetScaleDialog.close();
  };

  onOpen = async () => {
    const { replicaSet } = this;

    this.currentReplicas = await replicaSetApi.getReplicas({
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
        await replicaSetApi.scale({
          name: replicaSet.getName(),
          namespace: replicaSet.getNs(),
        }, desiredReplicas);
      }
      close();
    } catch (err) {
      Notifications.error(err);
    }
  };

  desiredReplicasUp = () => {
    this.desiredReplicas < this.scaleMax && this.desiredReplicas++;
  };

  desiredReplicasDown = () => {
    this.desiredReplicas > 0 && this.desiredReplicas--;
  };

  renderContents() {
    const { currentReplicas, desiredReplicas, onChange, scaleMax } = this;
    const warning = currentReplicas < 10 && desiredReplicas > 90;

    return (
      <>
        <div className="current-scale" data-testid="current-scale">
          <Trans>Current replica scale: {currentReplicas}</Trans>
        </div>
        <div className="flex gaps align-center">
          <div className="desired-scale" data-testid="desired-scale">
            <Trans>Desired number of replicas</Trans>: {desiredReplicas}
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
          <Trans>High number of replicas may cause cluster performance issues</Trans>
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
        <Trans>Scale Replica Set <span>{replicaSetName}</span></Trans>
      </h5>
    );

    return (
      <Dialog
        {...dialogProps}
        isOpen={ReplicaSetScaleDialog.isOpen}
        className={cssNames("ReplicaSetScaleDialog", className)}
        onOpen={this.onOpen}
        onClose={this.onClose}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep
            contentClass="flex gaps column"
            next={this.scale}
            nextLabel={<Trans>Scale</Trans>}
            disabledNext={!this.ready}
          >
            {this.renderContents()}
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
