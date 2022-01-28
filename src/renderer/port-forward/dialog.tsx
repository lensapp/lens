/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./dialog.scss";

import React, { useState } from "react";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../components/dialog";
import { Wizard, WizardStep } from "../components/wizard";
import { Input } from "../components/input";
import { cssNames } from "../utils";
import { openPortForward } from "./utils";
import { aboutPortForwarding, notifyErrorPortForwarding } from "./notify";
import { Checkbox } from "../components/checkbox";
import logger from "../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { PortForwardDialogState } from "./dialog.state.injectable";
import portForwardDialogStateInjectable from "./dialog.state.injectable";
import closePortForwardDialogInjectable from "./close-dialog.injectable";
import type { ForwardedPort, PortForwardItem } from "./port-forward";
import type { IComputedValue } from "mobx";
import portForwardsInjectable from "./port-forwards.injectable";
import addPortForwardInjectable from "./add.injectable";
import modifyPortForwardInjectable from "./modify.injectable";

export interface PortForwardDialogProps extends Partial<DialogProps> {
}

interface Dependencies {
  state: PortForwardDialogState;
  closePortForwardDialog: () => void;
  modifyPortForward: (portForward: ForwardedPort, desiredPort: number) => Promise<ForwardedPort>;
  addPortForward: (portForward: ForwardedPort) => Promise<ForwardedPort>;
  portForwards: IComputedValue<PortForwardItem[]>;
}

const NonInjectedPortForwardDialog = observer(({ state, closePortForwardDialog, portForwards, modifyPortForward, addPortForward, className, ...dialogProps }: Dependencies & PortForwardDialogProps) => {
  const [currentPort, setCurrentPort] = useState(0);
  const [desiredPort, setDesiredPort] = useState(0);
  const [openInBrowser, setOpenInBrowser] = useState(state.openInBrowser);
  const [useHttps, setUseHttps] = useState(state.useHttps);
  const { onClose, portForward, isOpen } = state;

  const onOpen = () => {
    setCurrentPort(+portForward.forwardPort);
    setDesiredPort(currentPort);
  };

  const changePort = (value: string) => {
    setDesiredPort(+value);
  };

  const startPortForward = async () => {
    try {
      // determine how many port-forwards already exist
      const length = portForwards.get().length;
      let newPortForward: ForwardedPort;

      portForward.protocol = useHttps ? "https" : "http";

      if (currentPort) {
        const wasRunning = portForward.status === "Active";

        newPortForward = await modifyPortForward(portForward, desiredPort);

        if (wasRunning && newPortForward.status === "Disabled") {
          notifyErrorPortForwarding(`Error occurred starting port-forward, the local port ${newPortForward.forwardPort} may not be available or the ${newPortForward.kind} ${newPortForward.name} may not be reachable`);
        }
      } else {
        portForward.forwardPort = desiredPort;
        newPortForward = await addPortForward(portForward);

        if (newPortForward.status === "Disabled") {
          notifyErrorPortForwarding(`Error occurred starting port-forward, the local port ${newPortForward.forwardPort} may not be available or the ${newPortForward.kind} ${newPortForward.name} may not be reachable`);
        } else {
          // if this is the first port-forward show the about notification
          if (!length) {
            aboutPortForwarding();
          }
        }
      }

      if (newPortForward.status === "Active" && openInBrowser) {
        openPortForward(newPortForward);
      }
    } catch (error) {
      logger.error(`[PORT-FORWARD-DIALOG]: ${error}`, portForward);
    } finally {
      closePortForwardDialog();
    }
  };

  const renderContents = () => (
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
            value={desiredPort === 0 ? "" : String(desiredPort)}
            placeholder={"Random"}
            onChange={changePort} />
        </div>
        <Checkbox
          data-testid="port-forward-https"
          label="https"
          value={useHttps}
          onChange={setUseHttps} />
        <Checkbox
          data-testid="port-forward-open"
          label="Open in Browser"
          value={openInBrowser}
          onChange={setOpenInBrowser} />
      </div>
    </>
  );

  return (
    <Dialog
      {...dialogProps}
      isOpen={isOpen}
      className={cssNames("PortForwardDialog", className)}
      onOpen={onOpen}
      onClose={onClose}
      close={closePortForwardDialog}
    >
      <Wizard header={<h5>Port Forwarding for <span>{portForward?.name}</span></h5>} done={closePortForwardDialog}>
        <WizardStep
          contentClass="flex gaps column"
          next={startPortForward}
          nextLabel={currentPort === 0 ? "Start" : "Modify"}
        >
          {renderContents()}
        </WizardStep>
      </Wizard>
    </Dialog>
  );
});

export const PortForwardDialog = withInjectables<Dependencies, PortForwardDialogProps>(NonInjectedPortForwardDialog, {
  getProps: (di, props) => ({
    state: di.inject(portForwardDialogStateInjectable),
    closePortForwardDialog: di.inject(closePortForwardDialogInjectable),
    portForwards: di.inject(portForwardsInjectable),
    addPortForward: di.inject(addPortForwardInjectable),
    modifyPortForward: di.inject(modifyPortForwardInjectable),
    ...props,
  }),
});
