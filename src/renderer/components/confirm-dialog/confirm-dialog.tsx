/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./confirm-dialog.scss";

import type { ReactNode } from "react";
import React from "react";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { cssNames, noop, prevDefault } from "../../utils";
import type { ButtonProps } from "../button";
import { Button } from "../button";
import type { DialogProps } from "../dialog";
import { Dialog } from "../dialog";
import { Icon } from "../icon";
import { Notifications } from "../notifications";

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

const defaultParams = {
  ok: noop,
  cancel: noop,
  labelOk: "Ok",
  labelCancel: "Cancel",
  icon: <Icon big material="warning"/>,
};

const dialogState = observable.box<ConfirmDialogParams | undefined>();

@observer
export class ConfirmDialog extends React.Component<ConfirmDialogProps> {
  @observable isSaving = false;

  constructor(props: ConfirmDialogProps & typeof defaultParams) {
    super(props);
    makeObservable(this);
  }

  static open(params: ConfirmDialogParams) {
    dialogState.set(params);
  }

  static confirm(params: ConfirmDialogBooleanParams): Promise<boolean> {
    return new Promise(resolve => {
      ConfirmDialog.open({
        ok: () => resolve(true),
        cancel: () => resolve(false),
        ...params,
      });
    });
  }

  static defaultParams = {
    ok: noop,
    cancel: noop,
    labelOk: "Ok",
    labelCancel: "Cancel",
    icon: <Icon big material="warning"/>,
  };

  get params() {
    return Object.assign({}, ConfirmDialog.defaultParams, dialogState.get());
  }

  ok = async () => {
    try {
      this.isSaving = true;
      await (async () => this.params.ok())();
    } catch (error) {
      Notifications.error(
        <>
          <p>Confirmation action failed:</p>
          <p>
            {(
              error instanceof Error
                ? error.message
                : typeof error === "string"
                  ? error
                  : "Unknown error occured while ok-ing"
            )}
          </p>
        </>,
      );
    } finally {
      this.isSaving = false;
      dialogState.set(undefined);
    }
  };

  onClose = () => {
    this.isSaving = false;
  };

  close = async () => {
    try {
      await Promise.resolve(this.params.cancel());
    } catch (error) {
      Notifications.error(
        <>
          <p>Cancelling action failed:</p>
          <p>
            {(
              error instanceof Error
                ? error.message
                : typeof error === "string"
                  ? error
                  : "Unknown error occured while cancelling"
            )}
          </p>
        </>,
      );
    } finally {
      this.isSaving = false;
      dialogState.set(undefined);
    }
  };

  render() {
    const { className, ...dialogProps } = this.props;
    const {
      icon, labelOk, labelCancel, message,
      okButtonProps = {},
      cancelButtonProps = {},
    } = this.params;
    const isOpen = Boolean(dialogState.get());

    return (
      <Dialog
        {...dialogProps}
        className={cssNames("ConfirmDialog", className)}
        isOpen={isOpen}
        onClose={this.onClose}
        close={this.close}
        {...(isOpen ? { "data-testid": "confirmation-dialog" } : {})}
      >
        <div className="confirm-content">
          {icon} 
          {" "}
          {message}
        </div>
        <div className="confirm-buttons">
          <Button
            plain
            className="cancel"
            label={labelCancel}
            onClick={prevDefault(this.close)}
            {...cancelButtonProps}
          />
          <Button
            autoFocus
            primary
            className="ok"
            label={labelOk}
            onClick={prevDefault(this.ok)}
            waiting={this.isSaving}
            data-testid="confirm"
            {...okButtonProps}
          />
        </div>
      </Dialog>
    );
  }
}
