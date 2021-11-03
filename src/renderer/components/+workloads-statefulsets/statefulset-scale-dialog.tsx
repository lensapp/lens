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

import "./statefulset-scale-dialog.scss";

import { StatefulSet, StatefulSetApi, statefulSetApi } from "../../../common/k8s-api/endpoints";
import React, { Component } from "react";
import { computed, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Icon } from "../icon";
import { Slider } from "../slider";
import { Notifications } from "../notifications";
import { cssNames } from "../../utils";

interface Props extends Partial<DialogProps> {
  statefulSetApi: StatefulSetApi
}

const dialogState = observable.object({
  isOpen: false,
  data: null as StatefulSet,
});

@observer
export class StatefulSetScaleDialog extends Component<Props> {
  static defaultProps = {
    statefulSetApi,
  };
  @observable ready = false;
  @observable currentReplicas = 0;
  @observable desiredReplicas = 0;

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  static open(statefulSet: StatefulSet) {
    dialogState.isOpen = true;
    dialogState.data = statefulSet;
  }

  static close() {
    dialogState.isOpen = false;
  }

  get statefulSet() {
    return dialogState.data;
  }

  close = () => {
    StatefulSetScaleDialog.close();
  };

  onOpen = async () => {
    const { statefulSet } = this;

    this.currentReplicas = await this.props.statefulSetApi.getReplicas({
      namespace: statefulSet.getNs(),
      name: statefulSet.getName(),
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
    const { statefulSet } = this;
    const { currentReplicas, desiredReplicas, close } = this;

    try {
      if (currentReplicas !== desiredReplicas) {
        await this.props.statefulSetApi.scale({
          name: statefulSet.getName(),
          namespace: statefulSet.getNs(),
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
    const statefulSetName = this.statefulSet ? this.statefulSet.getName() : "";
    const header = (
      <h5>
        Scale Stateful Set <span>{statefulSetName}</span>
      </h5>
    );

    return (
      <Dialog
        {...dialogProps}
        isOpen={dialogState.isOpen}
        className={cssNames("StatefulSetScaleDialog", className)}
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
