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

import "./confirm-dialog.scss";

import React, { ReactNode } from "react";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { cssNames, noop, prevDefault } from "../../utils";
import { Button, ButtonProps } from "../button";
import { Dialog, DialogProps } from "../dialog";
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

const dialogState = observable.object({
  isOpen: false,
  params: null as ConfirmDialogParams,
});

@observer
export class ConfirmDialog extends React.Component<ConfirmDialogProps> {
  @observable isSaving = false;

  constructor(props: ConfirmDialogProps) {
    super(props);
    makeObservable(this);
  }

  static open(params: ConfirmDialogParams) {
    dialogState.isOpen = true;
    dialogState.params = params;
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

  static defaultParams: Partial<ConfirmDialogParams> = {
    ok: noop,
    cancel: noop,
    labelOk: "Ok",
    labelCancel: "Cancel",
    icon: <Icon big material="warning"/>,
  };

  get params(): ConfirmDialogParams {
    return Object.assign({}, ConfirmDialog.defaultParams, dialogState.params);
  }

  ok = async () => {
    try {
      this.isSaving = true;
      await (async () => this.params.ok())();
    } catch (error) {
      Notifications.error(
        <>
          <p>Confirmation action failed:</p>
          <p>{error?.message ?? error?.toString?.() ?? "Unknown error"}</p>
        </>,
      );
    } finally {
      this.isSaving = false;
      dialogState.isOpen = false;
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
          <p>{error?.message ?? error?.toString?.() ?? "Unknown error"}</p>
        </>,
      );
    } finally {
      this.isSaving = false;
      dialogState.isOpen = false;
    }
  };

  render() {
    const { className, ...dialogProps } = this.props;
    const {
      icon, labelOk, labelCancel, message,
      okButtonProps = {},
      cancelButtonProps = {},
    } = this.params;

    return (
      <Dialog
        {...dialogProps}
        className={cssNames("ConfirmDialog", className)}
        isOpen={dialogState.isOpen}
        onClose={this.onClose}
        close={this.close}
      >
        <div className="confirm-content">
          {icon} {message}
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
            autoFocus primary
            className="ok"
            label={labelOk}
            onClick={prevDefault(this.ok)}
            waiting={this.isSaving}
            {...okButtonProps}
          />
        </div>
      </Dialog>
    );
  }
}
