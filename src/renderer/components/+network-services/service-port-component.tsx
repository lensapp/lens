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

import "./service-port-component.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import type { Service, ServicePort } from "../../../common/k8s-api/endpoints";
import { observable, makeObservable, reaction } from "mobx";
import { cssNames } from "../../utils";
import { Notifications } from "../notifications";
import { Button } from "../button";
import { aboutPortForwarding, getPortForward, getPortForwards, openPortForward, PortForwardStore, predictProtocol } from "../../port-forward";
import type { ForwardedPort } from "../../port-forward";
import { Spinner } from "../spinner";
import { withInjectables } from "@ogre-tools/injectable-react";
import portForwardStoreInjectable from "../../port-forward/port-forward-store/port-forward-store.injectable";
import removePortForwardInjectable from "../../port-forward/port-forward-store/remove-port-forward/remove-port-forward.injectable";
import portForwardDialogModelInjectable
  from "../../port-forward/port-forward-dialog-model/port-forward-dialog-model.injectable";
import addPortForwardInjectable
  from "../../port-forward/port-forward-store/add-port-forward/add-port-forward.injectable";

interface Props {
  service: Service;
  port: ServicePort;
}

interface Dependencies {
  portForwardStore: PortForwardStore
  removePortForward: (item: ForwardedPort) => Promise<void>
  addPortForward: (item: ForwardedPort) => Promise<number>
  openPortForwardDialog: (item: ForwardedPort, options: { openInBrowser: boolean }) => void
}

@observer
class NonInjectedServicePortComponent extends React.Component<Props & Dependencies> {
  @observable waiting = false;
  @observable forwardPort = 0;
  @observable isPortForwarded = false;

  constructor(props: Props & Dependencies) {
    super(props);
    makeObservable(this);
    this.checkExistingPortForwarding();
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => [this.props.portForwardStore.portForwards, this.props.service], () => this.checkExistingPortForwarding()),
    ]);
  }

  async checkExistingPortForwarding() {
    const { service, port } = this.props;
    const portForward: ForwardedPort = {
      kind: "service",
      name: service.getName(),
      namespace: service.getNs(),
      port: port.port,
      forwardPort: this.forwardPort,
    };

    let activePort: number;

    try {
      activePort = await getPortForward(portForward) ?? 0;
    } catch (error) {
      this.isPortForwarded = false;

      return;
    }

    this.forwardPort = activePort;
    this.isPortForwarded = activePort ? true : false;
  }

  async portForward() {
    const { service, port } = this.props;
    const portForward: ForwardedPort = {
      kind: "service",
      name: service.getName(),
      namespace: service.getNs(),
      port: port.port,
      forwardPort: this.forwardPort,
      protocol: predictProtocol(port.name),
    };

    this.waiting = true;

    try {
      // determine how many port-forwards are already active
      const { length } = await getPortForwards();

      this.forwardPort = await this.props.addPortForward(portForward);

      if (this.forwardPort) {
        portForward.forwardPort = this.forwardPort;
        openPortForward(portForward);
        this.isPortForwarded = true;

        // if this is the first port-forward show the about notification
        if (!length) {
          aboutPortForwarding();
        }
      }
    } catch (error) {
      Notifications.error(`Error occurred starting port-forward, the local port may not be available or the ${portForward.kind} ${portForward.name} may not be reachable`);
      this.checkExistingPortForwarding();
    } finally {
      this.waiting = false;
    }
  }

  async stopPortForward() {
    const { service, port } = this.props;
    const portForward: ForwardedPort = {
      kind: "service",
      name: service.getName(),
      namespace: service.getNs(),
      port: port.port,
      forwardPort: this.forwardPort,
    };

    this.waiting = true;

    try {
      await this.props.removePortForward(portForward);
      this.isPortForwarded = false;
    } catch (error) {
      Notifications.error(`Error occurred stopping the port-forward from port ${portForward.forwardPort}.`);
      this.checkExistingPortForwarding();
    } finally {
      this.waiting = false;
    }
  }

  render() {
    const { port, service } = this.props;

    const portForwardAction = async () => {
      if (this.isPortForwarded) {
        await this.stopPortForward();
      } else {
        const portForward: ForwardedPort = {
          kind: "service",
          name: service.getName(),
          namespace: service.getNs(),
          port: port.port,
          forwardPort: this.forwardPort,
          protocol: predictProtocol(port.name),
        };

        this.props.openPortForwardDialog(portForward, { openInBrowser: true });
      }
    };

    return (
      <div className={cssNames("ServicePortComponent", { waiting: this.waiting })}>
        <span title="Open in a browser" onClick={() => this.portForward()}>
          {port.toString()}
        </span>
        <Button primary onClick={() => portForwardAction()}> {this.isPortForwarded ? "Stop" : "Forward..."} </Button>
        {this.waiting && (
          <Spinner />
        )}
      </div>
    );
  }
}

export const ServicePortComponent = withInjectables<Dependencies, Props>(
  NonInjectedServicePortComponent,

  {
    getProps: (di, props) => ({
      portForwardStore: di.inject(portForwardStoreInjectable),
      removePortForward: di.inject(removePortForwardInjectable),
      addPortForward: di.inject(addPortForwardInjectable),
      openPortForwardDialog: di.inject(portForwardDialogModelInjectable).open,
      ...props,
    }),
  },
);

