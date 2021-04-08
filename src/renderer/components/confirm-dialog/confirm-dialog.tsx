import "./confirm-dialog.scss";

import React, { ReactNode } from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { cssNames, noop, prevDefault } from "../../utils";
import { Button, ButtonProps } from "../button";
import { Dialog, DialogProps } from "../dialog";
import { Icon } from "../icon";

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

@observer
export class ConfirmDialog extends React.Component<ConfirmDialogProps> {
  @observable static isOpen = false;
  @observable.ref static params: ConfirmDialogParams;

  @observable isSaving = false;

  static open(params: ConfirmDialogParams) {
    ConfirmDialog.isOpen = true;
    ConfirmDialog.params = params;
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
    return Object.assign({}, ConfirmDialog.defaultParams, ConfirmDialog.params);
  }

  ok = async () => {
    try {
      this.isSaving = true;
      await Promise.resolve(this.params.ok()).catch(noop);
    } finally {
      this.isSaving = false;
      ConfirmDialog.isOpen = false;
    }
  };

  onClose = () => {
    this.isSaving = false;
  };

  close = async () => {
    try {
      await Promise.resolve(this.params.cancel()).catch(noop);
    } finally {
      this.isSaving = false;
      ConfirmDialog.isOpen = false;
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
        isOpen={ConfirmDialog.isOpen}
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
