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
import { action, observable } from "mobx";
import { observer } from "mobx-react";
import { cssNames, noop, prevDefault } from "../../utils";
import { Button, ButtonProps } from "../button";
import { Dialog, DialogProps } from "../dialog";
import { Icon } from "../icon";

export interface ConfirmDialogProps extends Partial<DialogProps> {
}

export interface ConfirmDialogRootProps {
  className?: string;
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

const dialogState = observable.set<ConfirmDialogParams>([], { deep: false });

@observer
export class ConfirmDialog extends React.Component<ConfirmDialogRootProps> {
  static defaultParams: Partial<ConfirmDialogParams> = {
    ok: noop,
    cancel: noop,
    labelOk: "Ok",
    labelCancel: "Cancel",
    icon: <Icon big material="warning" />,
  };

  @action
  static open(params: ConfirmDialogParams) {
    dialogState.add({
      ...ConfirmDialog.defaultParams,
      ...params,
    });
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

  ok = async (params: ConfirmDialogParams) => {
    try {
      await params.ok();
    } catch {} finally {
      dialogState.delete(params);
    }
  };

  close = async (params: ConfirmDialogParams) => {
    try {
      await params.cancel();
    } catch { }  finally {
      dialogState.delete(params);
    }
  };

  render() {
    const { className } = this.props;

    return [...dialogState].reduce<JSX.Element>((prev, params) => {
      const {
        icon, labelOk, labelCancel, message,
        okButtonProps = {},
        cancelButtonProps = {},
      } = params;

      return (
        <>
          {prev}
          <Dialog
            className={cssNames("ConfirmDialog", className)}
            isOpen={true}
            close={() => this.close(params)}
          >
            <div className="confirm-content">
              {icon} {message}
            </div>
            <div className="confirm-buttons">
              <Button
                plain
                className="cancel"
                label={labelCancel}
                onClick={prevDefault(() => this.close(params))}
                {...cancelButtonProps}
              />
              <Button
                autoFocus primary
                className="ok"
                label={labelOk}
                onClick={prevDefault(() => this.ok(params))}
                {...okButtonProps}
              />
            </div>
          </Dialog>
        </>
      );
    }, null);
  }
}
