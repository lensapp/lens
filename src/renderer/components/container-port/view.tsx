/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { action, reaction, IComputedValue } from "mobx";
import { cssNames } from "../../utils";
import { Notifications } from "../notifications";
import { Button } from "../button";
import { aboutPortForwarding, notifyErrorPortForwarding, openPortForward, predictProtocol } from "../../port-forward";
import type { ForwardedPort } from "../../port-forward";
import { Spinner } from "../spinner";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import addPortForwardInjectable from "../../port-forward/add.injectable";
import portForwardsInjectable from "../../port-forward/port-forwards.injectable";
import getPortForwardInjectable from "../../port-forward/get.injectable";
import removePortForwardInjectable from "../../port-forward/remove.injectable";
import startPortForwardInjectable from "../../port-forward/start.injectable";
import type { PortForwardDialogOpenOptions } from "../../port-forward/open-dialog.injectable";
import openPortForwardDialogInjectable from "../../port-forward/open-dialog.injectable";
import type { KubeObject } from "../../../common/k8s-api/kube-object";

export interface ContainerPortProps {
  object: KubeObject;
  port: {
    name?: string;
    port: number;
    protocol: string;
  }
}

interface Dependencies {
  addPortForward: (portForward: ForwardedPort) => Promise<ForwardedPort>;
  getPortForward: (portForward: ForwardedPort) => Promise<ForwardedPort>;
  portForwards: IComputedValue<ForwardedPort[]>;
  removePortForward: (portForward: ForwardedPort) => Promise<void>;
  startPortForward: (portForward: ForwardedPort) => Promise<ForwardedPort>;
  openPortForwardDialog: (portForward: ForwardedPort, options?: PortForwardDialogOpenOptions) => void;
}

const NonInjectedContainerPort = observer(({ object, port, openPortForwardDialog, addPortForward, getPortForward, portForwards, removePortForward, startPortForward }: Dependencies & ContainerPortProps) => {
  const [waiting, setWaiting] = useState(false);
  const [forwardPort, setForwardPort] = useState(0);
  const [isPortForwarded, setIsPortForwarded] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const checkExistingPortForwarding = action(async () => {
    let portForward: ForwardedPort = {
      kind: object.kind,
      name: object.getName(),
      namespace: object.getNs(),
      port: port.port,
      forwardPort,
    };

    try {
      portForward = await getPortForward(portForward);
    } catch (error) {
      setIsPortForwarded(false);
      setIsActive(false);

      return;
    }

    setForwardPort(portForward.forwardPort);
    setIsPortForwarded(true);
    setIsActive(portForward.status === "Active");
  });

  const portForward = action(async () => {
    let portForward: ForwardedPort = {
      kind: object.kind,
      name: object.getName(),
      namespace: object.getNs(),
      port: port.port,
      forwardPort,
      protocol: predictProtocol(port.name),
      status: "Active",
    };

    setWaiting(true);

    try {
      // determine how many port-forwards already exist
      const { length } = portForwards.get();

      if (!isPortForwarded) {
        portForward = await addPortForward(portForward);
      } else if (!isActive) {
        portForward = await startPortForward(portForward);
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
      checkExistingPortForwarding();
      setWaiting(false);
    }
  });

  const stopPortForward = action(async () => {
    const portForward: ForwardedPort = {
      kind: object.kind,
      name: object.getName(),
      namespace: object.getNs(),
      port: port.port,
      forwardPort,
    };

    setWaiting(true);

    try {
      await removePortForward(portForward);
    } catch (error) {
      Notifications.error(`Error occurred stopping the port-forward from port ${portForward.forwardPort}.`);
    } finally {
      checkExistingPortForwarding();
      setForwardPort(0);
      setWaiting(false);
    }
  });

  const portForwardAction = action(async () => {
    if (isPortForwarded) {
      await stopPortForward();
    } else {
      const portForward: ForwardedPort = {
        kind: object.kind,
        name: object.getName(),
        namespace: object.getNs(),
        port: port.port,
        forwardPort,
        protocol: predictProtocol(port.name),
      };

      openPortForwardDialog(portForward, { openInBrowser: true, onClose: () => checkExistingPortForwarding() });
    }
  });

  useEffect(() => reaction(
    () => object,
    checkExistingPortForwarding,
    {
      fireImmediately: true,
    },
  ), []);

  const { name, port: containerPort, protocol } = port;
  const text = `${name ? `${name}: ` : ""}${containerPort}/${protocol}`;

  return (
    <div className={cssNames("ContainerPort", { waiting })}>
      <span title="Open in a browser" onClick={() => portForward()}>
        {text}
      </span>
      <Button primary onClick={portForwardAction}> {isPortForwarded ? (isActive ? "Stop/Remove" : "Remove") : "Forward..."} </Button>
      {waiting && (
        <Spinner />
      )}
    </div>
  );
});

export const ContainerPort = withInjectables<Dependencies, ContainerPortProps>(NonInjectedContainerPort, {
  getProps: (di, props) => ({
    addPortForward: di.inject(addPortForwardInjectable),
    getPortForward: di.inject(getPortForwardInjectable),
    portForwards: di.inject(portForwardsInjectable),
    removePortForward: di.inject(removePortForwardInjectable),
    startPortForward: di.inject(startPortForwardInjectable),
    openPortForwardDialog: di.inject(openPortForwardDialogInjectable),
    ...props,
  }),
});
