import "./deployment-scale-dialog.scss";

import React, { Component } from "react";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Deployment, deploymentApi } from "../../api/endpoints";
import { Icon } from "../icon";
import { Slider } from "../slider";
import { Notifications } from "../notifications";
import { cssNames } from "../../utils";

interface Props extends Partial<DialogProps> {
}

@observer
export class DeploymentScaleDialog extends Component<Props> {
  @observable static isOpen = false;
  @observable static data: Deployment = null;

  @observable ready = false;
  @observable currentReplicas = 0;
  @observable desiredReplicas = 0;

  static open(deployment: Deployment) {
    DeploymentScaleDialog.isOpen = true;
    DeploymentScaleDialog.data = deployment;
  }

  static close() {
    DeploymentScaleDialog.isOpen = false;
  }

  get deployment() {
    return DeploymentScaleDialog.data;
  }

  close = () => {
    DeploymentScaleDialog.close();
  }

  @computed get scaleMax() {
    const { currentReplicas } = this;
    const defaultMax = 50;
    return currentReplicas <= defaultMax
      ? defaultMax * 2
      : currentReplicas * 2;
  }

  onOpen = async () => {
    const { deployment } = this;
    this.currentReplicas = await deploymentApi.getReplicas({
      namespace: deployment.getNs(),
      name: deployment.getName(),
    });
    this.desiredReplicas = this.currentReplicas;
    this.ready = true;
  }

  onClose = () => {
    this.ready = false;
  }

  onChange = (evt: React.ChangeEvent, value: number) => {
    this.desiredReplicas = value;
  }

  scale = async () => {
    const { deployment } = this;
    const { currentReplicas, desiredReplicas, close } = this;
    try {
      if (currentReplicas !== desiredReplicas) {
        await deploymentApi.scale({
          name: deployment.getName(),
          namespace: deployment.getNs(),
        }, desiredReplicas);
      }
      close();
    } catch (err) {
      Notifications.error(err);
    }
  }

  desiredReplicasUp = () => {
    this.desiredReplicas < this.scaleMax && this.desiredReplicas++
  }
  
  desiredReplicasDown = () => {
    this.desiredReplicas > 1 && this.desiredReplicas--
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
          <div className="slider-container flex align-center">
            <Slider value={desiredReplicas} max={scaleMax} onChange={onChange as any /** see: https://github.com/mui-org/material-ui/issues/20191 */}/>
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
        <div className="warning">
          <Icon material="warning"/>
          <Trans>High number of replicas may cause cluster performance issues</Trans>
        </div>
        }
      </>
    )
  }

  render() {
    const { className, ...dialogProps } = this.props;
    const deploymentName = this.deployment ? this.deployment.getName() : "";
    const header = (
      <h5>
        <Trans>Scale Deployment <span>{deploymentName}</span></Trans>
      </h5>
    );
    return (
      <Dialog
        {...dialogProps}
        isOpen={DeploymentScaleDialog.isOpen}
        className={cssNames("DeploymentScaleDialog", className)}
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
