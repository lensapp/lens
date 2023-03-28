/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { Select } from "../select";
import type { CommandOverlay } from "../command-palette";
import { HotbarAddCommand } from "./hotbar-add-command";
import { HotbarRemoveCommand } from "./hotbar-remove-command";
import { HotbarRenameCommand } from "./hotbar-rename-command";
import { withInjectables } from "@ogre-tools/injectable-react";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";
import type { SetAsActiveHotbar } from "../../../features/hotbar/storage/common/set-as-active.injectable";
import type { IComputedValue } from "mobx";
import type { Hotbar } from "../../../features/hotbar/storage/common/hotbar";
import type { ComputeHotbarDisplayLabel } from "../../../features/hotbar/storage/common/compute-display-label.injectable";
import computeHotbarDisplayLabelInjectable from "../../../features/hotbar/storage/common/compute-display-label.injectable";
import hotbarsInjectable from "../../../features/hotbar/storage/common/hotbars.injectable";
import setAsActiveHotbarInjectable from "../../../features/hotbar/storage/common/set-as-active.injectable";

const hotbarAddAction = Symbol("hotbar-add");
const hotbarRemoveAction = Symbol("hotbar-remove");
const hotbarRenameAction = Symbol("hotbar-rename");

interface Dependencies {
  setAsActiveHotbar: SetAsActiveHotbar;
  computeHotbarDisplayLabel: ComputeHotbarDisplayLabel;
  hotbars: IComputedValue<Hotbar[]>;
  commandOverlay: CommandOverlay;
}

function ignoreIf<T>(check: boolean, menuItems: T[]): T[] {
  return check ? [] : menuItems;
}

const NonInjectedHotbarSwitchCommand = observer(({
  setAsActiveHotbar,
  computeHotbarDisplayLabel,
  hotbars,
  commandOverlay,
}: Dependencies) => (
  <Select
    id="switch-to-hotbar-input"
    menuPortalTarget={null}
    onChange={(option) => {
      if (!option) {
        return;
      }

      if (typeof option.value === "symbol") {
        switch (option.value) {
          case hotbarAddAction:
            return commandOverlay.open(<HotbarAddCommand />);
          case hotbarRemoveAction:
            return commandOverlay.open(<HotbarRemoveCommand />);
          case hotbarRenameAction:
            return commandOverlay.open(<HotbarRenameCommand />);
        }
      } else {
        setAsActiveHotbar(option.value);
        commandOverlay.close();
      }
    }}
    components={{ DropdownIndicator: null, IndicatorSeparator: null }}
    menuIsOpen={true}
    options={[
      ...hotbars.get().map(hotbar => ({
        value: hotbar,
        label: computeHotbarDisplayLabel(hotbar),
      })),
      {
        value: hotbarAddAction,
        label: "Add hotbar ...",
      },
      ...ignoreIf(hotbars.get().length > 1, [
        {
          value: hotbarRemoveAction,
          label: "Remove hotbar ...",
        },
      ]),
      {
        value: hotbarRenameAction,
        label: "Rename hotbar ...",
      },
    ]}
    autoFocus={true}
    escapeClearsValue={false}
    isClearable={false}
    placeholder="Switch to hotbar"
  />
));

export const HotbarSwitchCommand = withInjectables<Dependencies>(NonInjectedHotbarSwitchCommand, {
  getProps: (di, props) => ({
    ...props,
    commandOverlay: di.inject(commandOverlayInjectable),
    computeHotbarDisplayLabel: di.inject(computeHotbarDisplayLabelInjectable),
    hotbars: di.inject(hotbarsInjectable),
    setAsActiveHotbar: di.inject(setAsActiveHotbarInjectable),
  }),
});
