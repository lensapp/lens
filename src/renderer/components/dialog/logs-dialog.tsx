/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./logs-dialog.scss";

import React from "react";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Notifications } from "../notifications";
import { Button } from "../button";
import { Icon } from "../icon";
import { clipboard } from "electron";

// todo: make as external BrowserWindow (?)

interface Props extends DialogProps {
  title: string;
  logs: string;
}

export class LogsDialog extends React.Component<Props> {
  public logsElem: HTMLElement;

  copyToClipboard = () => {
    clipboard.writeText(this.props.logs);
    Notifications.ok(`Logs copied to clipboard.`);
  };

  render() {
    const { title, logs, ...dialogProps } = this.props;
    const header = <h5>{title}</h5>;
    const customButtons = (
      <div className="buttons flex gaps align-center justify-space-between">
        <Button plain onClick={this.copyToClipboard}>
          <Icon material="assignment"/> Copy to clipboard
        </Button>
        <Button plain onClick={dialogProps.close}>
          Close
        </Button>
      </div>
    );

    return (
      <Dialog
        {...dialogProps}
        className="LogsDialog"
      >
        <Wizard header={header} done={dialogProps.close}>
          <WizardStep scrollable={false} customButtons={customButtons}>
            <code className="block" ref={e => this.logsElem = e}>
              {logs || "There are no logs available."}
            </code>
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
