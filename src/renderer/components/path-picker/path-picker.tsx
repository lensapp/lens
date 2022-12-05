/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import type { FileFilter, OpenDialogOptions } from "electron";
import { observer } from "mobx-react";
import React from "react";
import type { OpenPathPickingDialog } from "../../../features/path-picking-dialog/renderer/pick-paths.injectable";
import openPathPickingDialogInjectable from "../../../features/path-picking-dialog/renderer/pick-paths.injectable";
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

interface Dependencies {
  openPathPickingDialog: OpenPathPickingDialog;
}

const NonInjectedPathPicker = observer((props: PathPickerProps & Dependencies) => {
  const {
    className,
    label,
    disabled,
    openPathPickingDialog,
    ...pickOpts
  } = props;

  return (
    <Button
      primary
      label={label}
      disabled={disabled}
      className={cssNames("PathPicker", className)}
      onClick={() => void openPathPickingDialog({
        label,
        ...pickOpts,
      })}
    />
  );
});

export const PathPicker = withInjectables<Dependencies, PathPickerProps>(NonInjectedPathPicker, {
  getProps: (di, props) => ({
    ...props,
    openPathPickingDialog: di.inject(openPathPickingDialogInjectable),
  }),
});
