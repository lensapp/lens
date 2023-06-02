/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./logs-dialog.scss";

import React from "react";
import type { DialogProps } from "../dialog";
import { Dialog } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import type { ShowNotification } from "@k8slens/notifications";
import { Button } from "@k8slens/button";
import { Icon } from "@k8slens/icon";
import { clipboard } from "electron";
import { kebabCase } from "lodash/fp";
import { withInjectables } from "@ogre-tools/injectable-react";
import { showSuccessNotificationInjectable } from "@k8slens/notifications";

export interface LogsDialogProps extends DialogProps {
  title: string;
  logs: string;
}

interface Dependencies {
  showSuccessNotification: ShowNotification;
}

const NonInjectedLogsDialog = (props: LogsDialogProps & Dependencies) => {
  const {
    title,
    logs,
    showSuccessNotification,
    ...dialogProps
  } = props;

  return (
    <Dialog
      {...dialogProps}
      className="LogsDialog"
      data-testid={`logs-dialog-for-${kebabCase(title)}`}
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
                  showSuccessNotification(`Logs copied to clipboard.`);
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
};

export const LogsDialog = withInjectables<Dependencies, LogsDialogProps>(NonInjectedLogsDialog, {
  getProps: (di, props) => ({
    ...props,
    showSuccessNotification: di.inject(showSuccessNotificationInjectable),
  }),
});
