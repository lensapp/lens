/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { Select } from "../select";
import hotbarStoreInjectable from "../../../common/hotbars/store.injectable";
import type { CommandOverlay } from "../command-palette";
import { HotbarAddCommand } from "./hotbar-add-command";
import { HotbarRemoveCommand } from "./hotbar-remove-command";
import { HotbarRenameCommand } from "./hotbar-rename-command";
import { withInjectables } from "@ogre-tools/injectable-react";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";
import type { HotbarStore } from "../../../common/hotbars/store";
import type { Hotbar } from "../../../common/hotbars/types";

const hotbarAddAction = Symbol("hotbar-add");
const hotbarRemoveAction = Symbol("hotbar-remove");
const hotbarRenameAction = Symbol("hotbar-rename");

interface Dependencies {
  hotbarStore: HotbarStore;
  commandOverlay: CommandOverlay;
}

function ignoreIf<T>(check: boolean, menuItems: T) {
  return check ? [] : menuItems;
}

function getHotbarSwitchOptions(hotbars: Hotbar[]): (Hotbar | typeof hotbarAddAction | typeof hotbarRemoveAction | typeof hotbarRenameAction)[] {
  return [
    ...hotbars,
    hotbarAddAction,
    ...ignoreIf(hotbars.length > 1, [
      hotbarRemoveAction,
    ] as const),
    hotbarRenameAction,
  ];
}

const NonInjectedHotbarSwitchCommand = observer(({
  hotbarStore,
  commandOverlay,
}: Dependencies) => (
  <Select
    id="switch-to-hotbar-input"
    menuPortalTarget={null}
    onChange={(value) => {
      switch (value) {
        case hotbarAddAction:
          return commandOverlay.open(<HotbarAddCommand />);
        case hotbarRemoveAction:
          return commandOverlay.open(<HotbarRemoveCommand />);
        case hotbarRenameAction:
          return commandOverlay.open(<HotbarRenameCommand />);

        default: {
          if (value) {
            hotbarStore.setActiveHotbar(value);
            commandOverlay.close();
          }
        }
      }
    } }
    components={{ DropdownIndicator: null, IndicatorSeparator: null }}
    menuIsOpen={true}
    options={getHotbarSwitchOptions(hotbarStore.hotbars)}
    getOptionLabel={actionOrId => {
      switch (actionOrId) {
        case hotbarAddAction:
          return "Add hotbar ...";
        case hotbarRemoveAction:
          return "Remove hotbar ...";
        case hotbarRenameAction:
          return "Rename hotbar ...";
        default:
          return hotbarStore.getDisplayLabel(actionOrId);
      }
    } }
    autoFocus={true}
    escapeClearsValue={false}
    placeholder="Switch to hotbar"
  />
));

export const HotbarSwitchCommand = withInjectables<Dependencies>(NonInjectedHotbarSwitchCommand, {
  getProps: (di, props) => ({
    hotbarStore: di.inject(hotbarStoreInjectable),
    commandOverlay: di.inject(commandOverlayInjectable),
    ...props,
  }),
});
