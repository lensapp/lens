/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./service-port-component.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import type { Service, ServicePort } from "../../../common/k8s-api/endpoints";
import { action, makeObservable, observable, reaction } from "mobx";
import { cssNames } from "../../utils";
import { Notifications } from "../notifications";
import { Button } from "../button";
import type { ForwardedPort, PortForwardStore } from "../../port-forward";
import { openPortForward, predictProtocol } from "../../port-forward";
import { Spinner } from "../spinner";
import { withInjectables } from "@ogre-tools/injectable-react";
import portForwardStoreInjectable from "../../port-forward/port-forward-store/port-forward-store.injectable";
import portForwardDialogModelInjectable from "../../port-forward/port-forward-dialog-model/port-forward-dialog-model.injectable";
import logger from "../../../common/logger";
import aboutPortForwardingInjectable from "../../port-forward/about-port-forwarding.injectable";
import notifyErrorPortForwardingInjectable from "../../port-forward/notify-error-port-forwarding.injectable";

export interface ServicePortComponentProps {
  service: Service;
  port: ServicePort;
}

interface Dependencies {
  portForwardStore: PortForwardStore;
  openPortForwardDialog: (item: ForwardedPort, options: { openInBrowser: boolean; onClose: () => void }) => void;
  aboutPortForwarding: () => void;
  notifyErrorPortForwarding: (message: string) => void;
}

@observer
class NonInjectedServicePortComponent extends React.Component<ServicePortComponentProps & Dependencies> {
  @observable waiting = false;
  @observable forwardPort = 0;
  @observable isPortForwarded = false;
  @observable isActive = false;

  constructor(props: ServicePortComponentProps & Dependencies) {
    super(props);
    makeObservable(this);
    this.checkExistingPortForwarding();
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.service, () => this.checkExistingPortForwarding()),
    ]);
  }

  get portForwardStore() {
    return this.props.portForwardStore;
  }

  @action
  async checkExistingPortForwarding() {
    const { service, port } = this.props;
    let portForward: ForwardedPort | undefined;

    try {
      portForward = await this.portForwardStore.getPortForward({
        kind: "service",
        name: service.getName(),
        namespace: service.getNs(),
        port: port.port,
        forwardPort: this.forwardPort,
      });
    } catch (error) {
      this.isPortForwarded = false;
      this.isActive = false;

      return;
    }

    if (!portForward) {
      return;
    }

    this.forwardPort = portForward.forwardPort;
    this.isPortForwarded = true;
    this.isActive = portForward.status === "Active";
  }

  @action
  async portForward() {
    const { service, port } = this.props;
    let portForward: ForwardedPort = {
      kind: "service",
      name: service.getName(),
      namespace: service.getNs(),
      port: port.port,
      forwardPort: this.forwardPort,
      protocol: predictProtocol(port.name),
      status: "Active",
    };

    this.waiting = true;

    try {
      // determine how many port-forwards already exist
      const { length } = this.portForwardStore.getPortForwards();

      if (!this.isPortForwarded) {
        portForward = await this.portForwardStore.add(portForward);
      } else if (!this.isActive) {
        portForward = await this.portForwardStore.start(portForward);
      }

      this.forwardPort = portForward.forwardPort;

      if (portForward.status === "Active") {
        openPortForward(portForward);

        // if this is the first port-forward show the about notification
        if (!length) {
          this.props.aboutPortForwarding();
        }
      } else {
        this.props.notifyErrorPortForwarding(`Error occurred starting port-forward, the local port may not be available or the ${portForward.kind} ${portForward.name} may not be reachable`);
      }
    } catch (error) {
      logger.error("[SERVICE-PORT-COMPONENT]:", error, portForward);
    } finally {
      this.checkExistingPortForwarding();
      this.waiting = false;
    }
  }

  @action
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
      await this.portForwardStore.remove(portForward);
    } catch (error) {
      Notifications.error(`Error occurred stopping the port-forward from port ${portForward.forwardPort}.`);
    } finally {
      this.checkExistingPortForwarding();
      this.forwardPort = 0;
      this.waiting = false;
    }
  }

  render() {
    const { port, service } = this.props;

    const portForwardAction = action(async () => {
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

        this.props.openPortForwardDialog(portForward, { openInBrowser: true, onClose: () => this.checkExistingPortForwarding() });
      }
    });

    return (
      <div className={cssNames("ServicePortComponent", { waiting: this.waiting })}>
        <span title="Open in a browser" onClick={() => this.portForward()}>
          {port.toString()}
        </span>
        <Button primary onClick={portForwardAction}> 
          {" "}
          {this.isPortForwarded ? (this.isActive ? "Stop/Remove" : "Remove") : "Forward..."}
          {" "}
        </Button>
        {this.waiting && (
          <Spinner />
        )}
      </div>
    );
  }
}

export const ServicePortComponent = withInjectables<Dependencies, ServicePortComponentProps>(
  NonInjectedServicePortComponent,

  {
    getProps: (di, props) => ({
      portForwardStore: di.inject(portForwardStoreInjectable),
      openPortForwardDialog: di.inject(portForwardDialogModelInjectable).open,
      aboutPortForwarding: di.inject(aboutPortForwardingInjectable),
      notifyErrorPortForwarding: di.inject(notifyErrorPortForwardingInjectable),
      ...props,
    }),
  },
);

