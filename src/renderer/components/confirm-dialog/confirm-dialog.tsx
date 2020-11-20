import "./confirm-dialog.scss";

import React, { ReactNode } from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { cssNames, noop, prevDefault } from "../../utils";
import { Button, ButtonProps } from "../button";
import { Dialog, DialogProps } from "../dialog";
import { Icon } from "../icon";

export interface ConfirmDialogProps extends Partial<DialogProps> {
}

export interface ConfirmDialogParams {
  ok?: () => void;
  labelOk?: ReactNode;
  labelCancel?: ReactNode;
  message?: ReactNode;
  icon?: ReactNode;
  okButtonProps?: Partial<ButtonProps>
  cancelButtonProps?: Partial<ButtonProps>
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

  static close() {
    ConfirmDialog.isOpen = false;
  }

  public defaultParams: ConfirmDialogParams = {
    ok: noop,
    labelOk: <Trans>Ok</Trans>,
    labelCancel: <Trans>Cancel</Trans>,
    icon: <Icon big material="warning"/>,
  };

  get params(): ConfirmDialogParams {
    return Object.assign({}, this.defaultParams, ConfirmDialog.params);
  }

  ok = async () => {
    try {
      this.isSaving = true;
      await Promise.resolve(this.params.ok()).catch(noop);
    } finally {
      this.isSaving = false;
    }
    this.close();
  }

  onClose = () => {
    this.isSaving = false;
  }

  close = () => {
    ConfirmDialog.close();
  }

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
    )
  }
}
