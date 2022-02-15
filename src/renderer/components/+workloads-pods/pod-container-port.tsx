/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pod-container-port.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import type { Pod } from "../../../common/k8s-api/endpoints";
import { action, makeObservable, observable, reaction } from "mobx";
import { cssNames } from "../../utils";
import { Notifications } from "../notifications";
import { Button } from "../button";
import type { ForwardedPort } from "../../port-forward";
import {
  aboutPortForwarding,
  notifyErrorPortForwarding,
  openPortForward,
  PortForwardStore,
  predictProtocol,
} from "../../port-forward";

import { Spinner } from "../spinner";
import { withInjectables } from "@ogre-tools/injectable-react";
import portForwardStoreInjectable from "../../port-forward/port-forward-store/port-forward-store.injectable";
import portForwardDialogModelInjectable from "../../port-forward/port-forward-dialog-model/port-forward-dialog-model.injectable";
import logger from "../../../common/logger";

interface Props {
  pod: Pod;
  port: {
    name?: string;
    containerPort: number;
    protocol: string;
  };
}

interface Dependencies {
  portForwardStore: PortForwardStore;
  openPortForwardDialog: (item: ForwardedPort, options: { openInBrowser: boolean; onClose: () => void }) => void;
}

@observer
class NonInjectedPodContainerPort extends React.Component<Props & Dependencies> {
  @observable waiting = false;
  @observable forwardPort = 0;
  @observable isPortForwarded = false;
  @observable isActive = false;

  constructor(props: Props & Dependencies) {
    super(props);
    makeObservable(this);
    this.checkExistingPortForwarding();
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.pod, () => this.checkExistingPortForwarding()),
    ]);
  }

  get portForwardStore() {
    return this.props.portForwardStore;
  }

  @action
  async checkExistingPortForwarding() {
    const { pod, port } = this.props;
    let portForward: ForwardedPort = {
      kind: "pod",
      name: pod.getName(),
      namespace: pod.getNs(),
      port: port.containerPort,
      forwardPort: this.forwardPort,
    };

    try {
      portForward = await this.portForwardStore.getPortForward(portForward);
    } catch (error) {
      this.isPortForwarded = false;
      this.isActive = false;

      return;
    }

    this.forwardPort = portForward.forwardPort;
    this.isPortForwarded = true;
    this.isActive = portForward.status === "Active";
  }

  @action
  async portForward() {
    const { pod, port } = this.props;
    let portForward: ForwardedPort = {
      kind: "pod",
      name: pod.getName(),
      namespace: pod.getNs(),
      port: port.containerPort,
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

      if (portForward.status === "Active") {
        openPortForward(portForward);

        // if this is the first port-forward show the about notification
        if (!length) {
          aboutPortForwarding();
        }
      } else {
        notifyErrorPortForwarding(`Error occurred starting port-forward, the local port may not be available or the ${portForward.kind} ${portForward.name} may not be reachable`);
      }
    } catch (error) {
      logger.error("[POD-CONTAINER-PORT]:", error, portForward);
    } finally {
      this.checkExistingPortForwarding();
      this.waiting = false;
    }
  }

  @action
  async stopPortForward() {
    const { pod, port } = this.props;
    const portForward: ForwardedPort = {
      kind: "pod",
      name: pod.getName(),
      namespace: pod.getNs(),
      port: port.containerPort,
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
    const { pod, port } = this.props;
    const { name, containerPort, protocol } = port;
    const text = `${name ? `${name}: ` : ""}${containerPort}/${protocol}`;

    const portForwardAction = action(async () => {
      if (this.isPortForwarded) {
        await this.stopPortForward();
      } else {
        const portForward: ForwardedPort = {
          kind: "pod",
          name: pod.getName(),
          namespace: pod.getNs(),
          port: port.containerPort,
          forwardPort: this.forwardPort,
          protocol: predictProtocol(port.name),
        };

        this.props.openPortForwardDialog(portForward, { openInBrowser: true, onClose: () => this.checkExistingPortForwarding() });
      }
    });

    return (
      <div className={cssNames("PodContainerPort", { waiting: this.waiting })}>
        <span title="Open in a browser" onClick={() => this.portForward()}>
          {text}
        </span>
        <Button primary onClick={portForwardAction}> {this.isPortForwarded ? (this.isActive ? "Stop/Remove" : "Remove") : "Forward..."} </Button>
        {this.waiting && (
          <Spinner />
        )}
      </div>
    );
  }
}

export const PodContainerPort = withInjectables<Dependencies, Props>(
  NonInjectedPodContainerPort,

  {
    getProps: (di, props) => ({
      portForwardStore: di.inject(portForwardStoreInjectable),
      openPortForwardDialog: di.inject(portForwardDialogModelInjectable).open,
      ...props,
    }),
  },
);
