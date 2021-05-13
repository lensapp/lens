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

import "./logs-dialog.scss";

import React from "react";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { copyToClipboard } from "../../utils";
import { Notifications } from "../notifications";
import { Button } from "../button";
import { Icon } from "../icon";

// todo: make as external BrowserWindow (?)

interface Props extends DialogProps {
  title: string;
  logs: string;
}

export class LogsDialog extends React.Component<Props> {
  public logsElem: HTMLElement;

  copyToClipboard = () => {
    if (copyToClipboard(this.logsElem)) {
      Notifications.ok(`Logs copied to clipboard.`);
    }
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
      <Dialog {...dialogProps} className="LogsDialog">
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
