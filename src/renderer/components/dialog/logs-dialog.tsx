/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./logs-dialog.scss";

import React from "react";
import type { DialogProps } from "../dialog";
import { Dialog } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Notifications } from "../notifications";
import { Button } from "../button";
import { Icon } from "../icon";
import { clipboard } from "electron";

// todo: make as external BrowserWindow (?)

export interface LogsDialogProps extends DialogProps {
  title: string;
  logs: string;
}

export function LogsDialog({ title, logs, ...dialogProps }: LogsDialogProps) {
  return (
    <Dialog
      {...dialogProps}
      className="LogsDialog"
    >
      <Wizard
        header={<h5>{title}</h5>}
        done={dialogProps.close}
      >
        <WizardStep
          scrollable={false}
          customButtons={(
            <div className="buttons flex gaps align-center justify-space-between">
              <Button
                plain
                onClick={() => {
                  clipboard.writeText(logs);
                  Notifications.ok(`Logs copied to clipboard.`);
                }}
              >
                <Icon material="assignment"/>
                {" Copy to clipboard"}
              </Button>
              <Button plain onClick={dialogProps.close}>
                Close
              </Button>
            </div>
          )}
        >
          <code className="block">
            {logs || "There are no logs available."}
          </code>
        </WizardStep>
      </Wizard>
    </Dialog>
  );
}
