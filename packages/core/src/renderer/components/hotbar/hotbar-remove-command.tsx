/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { Select } from "../select";
import { withInjectables } from "@ogre-tools/injectable-react";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";
import type { OpenConfirmDialog } from "../confirm-dialog/open.injectable";
import openConfirmDialogInjectable from "../confirm-dialog/open.injectable";
import type { IComputedValue } from "mobx";
import type { Hotbar } from "../../../features/hotbar/storage/common/hotbar";
import type { ComputeHotbarDisplayLabel } from "../../../features/hotbar/storage/common/compute-display-label.injectable";
import computeHotbarDisplayLabelInjectable from "../../../features/hotbar/storage/common/compute-display-label.injectable";
import hotbarsInjectable from "../../../features/hotbar/storage/common/hotbars.injectable";
import type { RemoveHotbar } from "../../../features/hotbar/storage/common/remove.injectable";
import removeHotbarInjectable from "../../../features/hotbar/storage/common/remove.injectable";

interface Dependencies {
  closeCommandOverlay: () => void;
  openConfirmDialog: OpenConfirmDialog;
  hotbars: IComputedValue<Hotbar[]>;
  computeHotbarDisplayLabel: ComputeHotbarDisplayLabel;
  removeHotbar: RemoveHotbar;
}

const NonInjectedHotbarRemoveCommand = observer(({
  closeCommandOverlay,
  openConfirmDialog,
  hotbars,
  computeHotbarDisplayLabel,
  removeHotbar,
}: Dependencies) => (
  <Select
    menuPortalTarget={null}
    onChange={option => {
      if (!option) {
        return;
      }

      closeCommandOverlay();
      openConfirmDialog({
        okButtonProps: {
          label: "Remove Hotbar",
          primary: false,
          accent: true,
        },
        ok: () => removeHotbar(option.value),
        message: (
          <div className="confirm flex column gaps">
            <p>
              Are you sure you want remove hotbar
              {" "}
              <b>
                {option.value.name.get()}
              </b>
              ?
            </p>
          </div>
        ),
      });
    }}
    components={{ DropdownIndicator: null, IndicatorSeparator: null }}
    menuIsOpen={true}
    options={(
      hotbars.get()
        .map(hotbar => ({
          value: hotbar,
          label: computeHotbarDisplayLabel(hotbar),
        }))
    )}
    autoFocus={true}
    escapeClearsValue={false}
    placeholder="Remove hotbar"
  />
));

export const HotbarRemoveCommand = withInjectables<Dependencies>(NonInjectedHotbarRemoveCommand, {
  getProps: (di, props) => ({
    ...props,
    closeCommandOverlay: di.inject(commandOverlayInjectable).close,
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
    computeHotbarDisplayLabel: di.inject(computeHotbarDisplayLabelInjectable),
    hotbars: di.inject(hotbarsInjectable),
    removeHotbar: di.inject(removeHotbarInjectable),
  }),
});
