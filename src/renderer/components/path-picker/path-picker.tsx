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

import { FileFilter, OpenDialogOptions, remote } from "electron";
import { observer } from "mobx-react";
import React from "react";
import { cssNames } from "../../utils";
import { Button } from "../button";

export interface PathPickerProps {
  className?: string;
  label: string;
  disabled?: boolean;
  onPick?: (paths: string[]) => void;
  onCancel?: () => void;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: FileFilter[];
  properties?: OpenDialogOptions["properties"];
  securityScopedBookmarks?: boolean;
}

@observer
export class PathPicker extends React.Component<PathPickerProps> {
  async onClick() {
    const { onPick, onCancel, label, className, disabled, ...dialogOptions } = this.props;
    const { dialog, BrowserWindow } = remote;
    const { canceled, filePaths } = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
      message: label,
      ...dialogOptions,
    });

    if (canceled) {
      onCancel?.();
    } else {
      onPick?.(filePaths);
    }
  }

  render() {
    const { className, label, disabled } = this.props;

    return (
      <Button
        primary
        label={label}
        disabled={disabled}
        className={cssNames("PathPicker", className)}
        onClick={() => void this.onClick()}
      />
    );
  }
}
