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
import { cssNames, noop } from "../utils";
import { addPortForward, getPortForwards, modifyPortForward } from "./port-forward.store";
import type { ForwardedPort } from "./port-forward-item";
import { openPortForward } from "./port-forward-utils";
import { aboutPortForwarding, notifyErrorPortForwarding } from "./port-forward-notify";
import { Checkbox } from "../components/checkbox";
import logger from "../../common/logger";

interface Props extends Partial<DialogProps> {
}

interface PortForwardDialogOpenOptions {
  openInBrowser: boolean;
  onClose: () => void;
}

const dialogState = observable.object({
  isOpen: false,
  data: null as ForwardedPort,
  useHttps: false,
  openInBrowser: false,
  onClose: noop,
});

@observer
export class PortForwardDialog extends Component<Props> {
  @observable currentPort = 0;
  @observable desiredPort = 0;

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  static open(portForward: ForwardedPort, options: PortForwardDialogOpenOptions = { openInBrowser: false, onClose: noop }) {
    dialogState.isOpen = true;
    dialogState.data = portForward;
    dialogState.useHttps = portForward.protocol === "https";
    dialogState.openInBrowser = options.openInBrowser;
    dialogState.onClose = options.onClose;
  }

  static close() {
    dialogState.isOpen = false;
  }

  get portForward() {
    return dialogState.data;
  }

  close = () => {
    PortForwardDialog.close();
  };

  onOpen = async () => {
    const { portForward } = this;

    this.currentPort = +portForward.forwardPort;
    this.desiredPort = this.currentPort;
  };

  changePort = (value: string) => {
    this.desiredPort = Number(value);
  };

  startPortForward = async () => {
    let { portForward } = this;
    const { currentPort, desiredPort, close } = this;

    try {
      // determine how many port-forwards already exist
      const { length } = getPortForwards();

      portForward.protocol = dialogState.useHttps ? "https" : "http";

      if (currentPort) {
        const wasRunning = portForward.status === "Active";

        portForward = await modifyPortForward(portForward, desiredPort);
        
        if (wasRunning && portForward.status === "Disabled") {
          notifyErrorPortForwarding(`Error occurred starting port-forward, the local port ${portForward.forwardPort} may not be available or the ${portForward.kind} ${portForward.name} may not be reachable`);
        }
      } else {
        portForward.forwardPort = desiredPort;
        portForward = await addPortForward(portForward);

        if (portForward.status === "Disabled") {
          notifyErrorPortForwarding(`Error occurred starting port-forward, the local port ${portForward.forwardPort} may not be available or the ${portForward.kind} ${portForward.name} may not be reachable`);
        } else {
          // if this is the first port-forward show the about notification
          if (!length) {
            aboutPortForwarding();
          }
        }
      }

      if (portForward.status === "Active" && dialogState.openInBrowser) {
        openPortForward(portForward);
      }
    } catch (error) {
      logger.error(`[PORT-FORWARD-DIALOG]: ${error}`, portForward);
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
            value={dialogState.useHttps}
            onChange={value => dialogState.useHttps = value}
          />
          <Checkbox
            data-testid="port-forward-open"
            label="Open in Browser"
            value={dialogState.openInBrowser}
            onChange={value => dialogState.openInBrowser = value}
          />
        </div>
      </>
    );
  }

  render() {
    const { className, ...dialogProps } = this.props;
    const resourceName = this.portForward?.name ?? "";
    const header = (
      <h5>
        Port Forwarding for <span>{resourceName}</span>
      </h5>
    );

    return (
      <Dialog
        {...dialogProps}
        isOpen={dialogState.isOpen}
        className={cssNames("PortForwardDialog", className)}
        onOpen={this.onOpen}
        onClose={dialogState.onClose}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep
            contentClass="flex gaps column"
            next={this.startPortForward}
            nextLabel={this.currentPort === 0 ? "Start" : "Modify"}
          >
            {this.renderContents()}
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
