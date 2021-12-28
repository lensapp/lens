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

import "./port-forward-dialog.scss";

import React, { Component } from "react";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../components/dialog";
import { Wizard, WizardStep } from "../components/wizard";
import { Input } from "../components/input";
import { Notifications } from "../components/notifications";
import { cssNames } from "../utils";
import { getPortForwards } from "./port-forward-store/port-forward-store";
import type { ForwardedPort } from "./port-forward-item";
import { aboutPortForwarding, openPortForward } from ".";
import { Checkbox } from "../components/checkbox";
import { withInjectables } from "@ogre-tools/injectable-react";
import modifyPortForwardInjectable from "./port-forward-store/modify-port-forward/modify-port-forward.injectable";
import type { PortForwardDialogModel } from "./port-forward-dialog-model/port-forward-dialog-model";
import portForwardDialogModelInjectable from "./port-forward-dialog-model/port-forward-dialog-model.injectable";
import addPortForwardInjectable from "./port-forward-store/add-port-forward/add-port-forward.injectable";

interface Props extends Partial<DialogProps> {
}

interface Dependencies {
  modifyPortForward: (item: ForwardedPort, desiredPort: number) => Promise<number>,
  addPortForward: (item: ForwardedPort) => Promise<number>,
  model: PortForwardDialogModel
}

@observer
class NonInjectedPortForwardDialog extends Component<Props & Dependencies> {
  @observable currentPort = 0;
  @observable desiredPort = 0;

  constructor(props: Props & Dependencies) {
    super(props);
    makeObservable(this);
  }

  onOpen = async () => {
    this.currentPort = +this.props.model.portForward.forwardPort;
    this.desiredPort = this.currentPort;
  };

  onClose = () => {
  };

  changePort = (value: string) => {
    this.desiredPort = Number(value);
  };

  startPortForward = async () => {
    const portForward = this.props.model.portForward;
    const { currentPort, desiredPort } = this;

    try {
      // determine how many port-forwards are already active
      const { length } = await getPortForwards();

      let port: number;

      portForward.protocol = this.props.model.useHttps ? "https" : "http";

      if (currentPort) {
        port = await this.props.modifyPortForward(portForward, desiredPort);
      } else {
        portForward.forwardPort = desiredPort;
        port = await this.props.addPortForward(portForward);

        // if this is the first port-forward show the about notification
        if (!length) {
          aboutPortForwarding();
        }
      }

      if (this.props.model.openInBrowser) {
        portForward.forwardPort = port;
        openPortForward(portForward);
      }
    } catch (err) {
      Notifications.error(`Error occurred starting port-forward, the local port may not be available or the ${portForward.kind} ${portForward.name} may not be reachable`);
    } finally {
      close();
    }
  };

  renderContents() {
    return (
      <>
        <div className="flex column gaps align-left">
          <div className="input-container flex align-center">
            <div className="current-port" data-testid="current-port">
              Local port to forward from:
            </div>
            <Input className="portInput"
              type="number"
              min="0"
              max="65535"
              value={this.desiredPort === 0 ? "" : String(this.desiredPort)}
              placeholder={"Random"}
              onChange={this.changePort}
            />
          </div>
          <Checkbox
            data-testid="port-forward-https"
            label="https"
            value={this.props.model.useHttps}
            onChange={value => this.props.model.useHttps = value}
          />
          <Checkbox
            data-testid="port-forward-open"
            label="Open in Browser"
            value={this.props.model.openInBrowser}
            onChange={value => this.props.model.openInBrowser = value}
          />
        </div>
      </>
    );
  }

  render() {
    const { className, modifyPortForward, model, ...dialogProps } = this.props;
    const resourceName = this.props.model.portForward?.name ?? "";
    const header = (
      <h5>
        Port Forwarding for <span>{resourceName}</span>
      </h5>
    );

    return (
      <Dialog
        {...dialogProps}
        isOpen={this.props.model.isOpen}
        className={cssNames("PortForwardDialog", className)}
        onOpen={this.onOpen}
        onClose={this.onClose}
        close={this.props.model.close}
      >
        <Wizard header={header} done={this.props.model.close}>
          <WizardStep
            contentClass="flex gaps column"
            next={this.startPortForward}
            nextLabel={this.currentPort === 0 ? "Start" : "Restart"}
          >
            {this.renderContents()}
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}

export const PortForwardDialog = withInjectables<Dependencies, Props>(
  NonInjectedPortForwardDialog,

  {
    getProps: (di, props) => ({
      modifyPortForward: di.inject(modifyPortForwardInjectable),
      addPortForward: di.inject(addPortForwardInjectable),
      model: di.inject(portForwardDialogModelInjectable),
      ...props,
    }),
  },
);
