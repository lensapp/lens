/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./confirm-dialog.scss";

import React, { ReactNode, useState } from "react";
import { observer } from "mobx-react";
import { cssNames, prevDefault } from "../../utils";
import { Button, ButtonProps } from "../button";
import { Dialog, DialogProps } from "../dialog";
import { Icon } from "../icon";
import { Notifications } from "../notifications";
import { withInjectables } from "@ogre-tools/injectable-react";
import confirmDialogStateInjectable, { ConfirmDialogState } from "./dialog.state.injectable";
import closeConfirmDialogInjectable from "./dialog-close.injectable";

export interface ConfirmDialogProps extends Partial<DialogProps> {
}

export interface ConfirmDialogParams extends ConfirmDialogBooleanParams {
  ok?: () => any | Promise<any>;
  cancel?: () => any | Promise<any>;
}

export interface ConfirmDialogBooleanParams {
  labelOk?: ReactNode;
  labelCancel?: ReactNode;
  message: ReactNode;
  icon?: ReactNode;
  okButtonProps?: Partial<ButtonProps>;
  cancelButtonProps?: Partial<ButtonProps>;
}

interface Dependencies {
  state: ConfirmDialogState;
  closeConfirmDialog: () => void;
}

const NonInjectedConfirmDialog = observer(({ state, closeConfirmDialog, className, ...dialogProps }: Dependencies & ConfirmDialogProps) => {
  const [isActing, setIsActing] = useState(false);
  const isOpen = Boolean(state.params);

  const {
    message,
    icon = <Icon big material="warning"/>,
    labelCancel = "Cancel",
    cancel,
    cancelButtonProps = {},
    labelOk = "Ok",
    ok,
    okButtonProps = {},
  } = state.params ?? {};

  const actionOk = async () => {
    try {
      setIsActing(true);
      await ok?.();
    } catch (error) {
      Notifications.error(
        <>
          <p>Confirmation action failed:</p>
          <p>{error?.message ?? error?.toString?.() ?? "Unknown error"}</p>
        </>,
      );
    } finally {
      setIsActing(false);
      closeConfirmDialog();
    }
  };

  const onClose = () => setIsActing(false);

  const actionClose = async () => {
    try {
      await cancel?.();
    } catch (error) {
      Notifications.error(
        <>
          <p>Cancelling action failed:</p>
          <p>{error?.message ?? error?.toString?.() ?? "Unknown error"}</p>
        </>,
      );
    } finally {
      setIsActing(false);
      closeConfirmDialog();
    }
  };

  return (
    <Dialog
      {...dialogProps}
      className={cssNames("ConfirmDialog", className)}
      isOpen={isOpen}
      onClose={onClose}
      close={actionClose}
      data-testid="confirmation-dialog"
    >
      <div className="confirm-content">
        {icon} {message}
      </div>
      <div className="confirm-buttons">
        <Button
          plain
          className="cancel"
          label={labelCancel}
          onClick={prevDefault(actionClose)}
          {...cancelButtonProps}
        />
        <Button
          autoFocus primary
          className="ok"
          label={labelOk}
          onClick={prevDefault(actionOk)}
          waiting={isActing}
          data-testid="confirm"
          {...okButtonProps}
        />
      </div>
    </Dialog>
  );
});

export const ConfirmDialog = withInjectables<Dependencies, ConfirmDialogProps>(NonInjectedConfirmDialog, {
  getProps: (di, props) => ({
    closeConfirmDialog: di.inject(closeConfirmDialogInjectable),
    state: di.inject(confirmDialogStateInjectable),
    ...props,
  }),
});
