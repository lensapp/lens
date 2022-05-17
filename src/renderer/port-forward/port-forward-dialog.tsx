/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./port-forward-dialog.scss";

import React, { Component } from "react";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import type { DialogProps } from "../components/dialog";
import { Dialog } from "../components/dialog";
import { Wizard, WizardStep } from "../components/wizard";
import { Input } from "../components/input";
import { cssNames } from "../utils";
import type { PortForwardStore } from "./port-forward-store/port-forward-store";
import { openPortForward } from "./port-forward-utils";
import { Checkbox } from "../components/checkbox";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { PortForwardDialogData, PortForwardDialogModel } from "./port-forward-dialog-model/port-forward-dialog-model";
import portForwardDialogModelInjectable from "./port-forward-dialog-model/port-forward-dialog-model.injectable";
import logger from "../../common/logger";
import portForwardStoreInjectable from "./port-forward-store/port-forward-store.injectable";
import aboutPortForwardingInjectable from "./about-port-forwarding.injectable";
import notifyErrorPortForwardingInjectable from "./notify-error-port-forwarding.injectable";

export interface PortForwardDialogProps extends Partial<DialogProps> {}

interface Dependencies {
  portForwardStore: PortForwardStore;
  model: PortForwardDialogModel;
  aboutPortForwarding: () => void;
  notifyErrorPortForwarding: (message: string) => void;
}

@observer
class NonInjectedPortForwardDialog extends Component<PortForwardDialogProps & Dependencies> {
  @observable currentPort = 0;
  @observable desiredPort = 0;

  constructor(props: PortForwardDialogProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  get portForwardStore() {
    return this.props.portForwardStore;
  }

  onOpen = async (data: PortForwardDialogData) => {
    this.currentPort = +data.portForward.forwardPort;
    this.desiredPort = this.currentPort;
  };

  changePort = (value: string) => {
    this.desiredPort = Number(value);
  };

  startPortForward = async (data: PortForwardDialogData) => {
    let { portForward } = data;
    const { currentPort, desiredPort } = this;

    try {
      // determine how many port-forwards already exist
      const { length } = this.portForwardStore.getPortForwards();

      portForward.protocol = data.useHttps ? "https" : "http";

      if (currentPort) {
        const wasRunning = portForward.status === "Active";

        portForward = await this.portForwardStore.modify(portForward, desiredPort);

        if (wasRunning && portForward.status === "Disabled") {
          this.props.notifyErrorPortForwarding(`Error occurred starting port-forward, the local port ${portForward.forwardPort} may not be available or the ${portForward.kind} ${portForward.name} may not be reachable`);
        }
      } else {
        portForward.forwardPort = desiredPort;
        portForward = await this.portForwardStore.add(portForward);

        if (portForward.status === "Disabled") {
          this.props.notifyErrorPortForwarding(`Error occurred starting port-forward, the local port ${portForward.forwardPort} may not be available or the ${portForward.kind} ${portForward.name} may not be reachable`);
        } else {
          // if this is the first port-forward show the about notification
          if (!length) {
            this.props.aboutPortForwarding();
          }
        }
      }

      if (portForward.status === "Active" && data.openInBrowser) {
        openPortForward(portForward);
      }
    } catch (error) {
      logger.error(`[PORT-FORWARD-DIALOG]: ${error}`, portForward);
    } finally {
      this.props.model.close();
    }
  };

  renderContents(data: PortForwardDialogData) {
    return (
      <Wizard
        header={(
          <h5>
            {"Port Forwarding for "}
            <span>{data.portForward.name}</span>
          </h5>
        )}
        done={this.props.model.close}
      >
        <WizardStep
          contentClass="flex gaps column"
          next={() => this.startPortForward(data)}
          nextLabel={this.currentPort === 0 ? "Start" : "Modify"}
        >
          <div className="flex column gaps align-left">
            <div className="input-container flex align-center">
              <div className="current-port" data-testid="current-port">
                Local port to forward from:
              </div>
              <Input
                className="portInput"
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
              value={data.useHttps}
              onChange={value => data.useHttps = value}
            />
            <Checkbox
              data-testid="port-forward-open"
              label="Open in Browser"
              value={data.openInBrowser}
              onChange={value => data.openInBrowser = value}
            />
          </div>
        </WizardStep>
      </Wizard>
    );
  }

  render() {
    const { className, portForwardStore, model, ...dialogProps } = this.props;
    const data = model.data.get();
    const isOpen = Boolean(data);

    return (
      <Dialog
        {...dialogProps}
        isOpen={isOpen}
        className={cssNames("PortForwardDialog", className)}
        onOpen={data && (() => this.onOpen(data))}
        onClose={data?.onClose}
        close={this.props.model.close}
      >
        {data && this.renderContents(data)}
      </Dialog>
    );
  }
}

export const PortForwardDialog = withInjectables<Dependencies, PortForwardDialogProps>(
  NonInjectedPortForwardDialog,

  {
    getProps: (di, props) => ({
      portForwardStore: di.inject(portForwardStoreInjectable),
      model: di.inject(portForwardDialogModelInjectable),
      aboutPortForwarding: di.inject(aboutPortForwardingInjectable),
      notifyErrorPortForwarding: di.inject(notifyErrorPortForwardingInjectable),
      ...props,
    }),
  },
);
