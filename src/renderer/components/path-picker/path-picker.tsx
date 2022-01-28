/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { FileFilter, OpenDialogOptions, remote } from "electron";
import { observer } from "mobx-react";
import React from "react";
import { cssNames } from "../../utils";
import { Button } from "../button";

export interface PathPickOpts {
  label: string;
  onPick?: (paths: string[]) => any;
  onCancel?: () => any;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: FileFilter[];
  properties?: OpenDialogOptions["properties"];
  securityScopedBookmarks?: boolean;
}

export interface PathPickerProps extends PathPickOpts {
  className?: string;
  disabled?: boolean;
}

@observer
export class PathPicker extends React.Component<PathPickerProps> {
  static async pick(opts: PathPickOpts) {
    const { onPick, onCancel, label, ...dialogOptions } = opts;
    const { dialog, BrowserWindow } = remote;
    const { canceled, filePaths } = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
      message: label,
      ...dialogOptions,
    });

    if (canceled) {
      await onCancel?.();
    } else {
      await onPick?.(filePaths);
    }
  }

  onClick() {
    const { className, disabled, ...pickOpts } = this.props;

    return PathPicker.pick(pickOpts);
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
