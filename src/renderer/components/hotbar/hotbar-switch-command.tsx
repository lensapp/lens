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

function ignoreIf<T>(check: boolean, menuItems: T[]): T[] {
  return check ? [] : menuItems;
}

interface HotbarSwitchActionOption {
  action: typeof hotbarAddAction | typeof hotbarRemoveAction | typeof hotbarRenameAction;
}

interface SwitchToHotbarOption {
  hotbar: Hotbar;
}

type HotbarSwitchOption = SwitchToHotbarOption | HotbarSwitchActionOption;

function getHotbarSwitchOptions(hotbars: Hotbar[]): HotbarSwitchOption[] {
  return [
    ...hotbars.map(hotbar => ({ hotbar })),
    { action: hotbarAddAction },
    ...ignoreIf(hotbars.length > 1, [
      { action: hotbarRemoveAction } as const,
    ]),
    { action: hotbarRenameAction },
  ];
}

function isActionOption(option: HotbarSwitchOption): option is HotbarSwitchActionOption {
  return Boolean((option as HotbarSwitchActionOption).action);
}

const NonInjectedHotbarSwitchCommand = observer(({
  hotbarStore,
  commandOverlay,
}: Dependencies) => (
  <Select
    id="switch-to-hotbar-input"
    menuPortalTarget={null}
    onChange={(option) => {
      if (!option) {
        return;
      }

      if (isActionOption(option)) {
        switch (option.action) {
          case hotbarAddAction:
            return commandOverlay.open(<HotbarAddCommand />);
          case hotbarRemoveAction:
            return commandOverlay.open(<HotbarRemoveCommand />);
          case hotbarRenameAction:
            return commandOverlay.open(<HotbarRenameCommand />);
        }
      }

      hotbarStore.setActiveHotbar(option.hotbar);
      commandOverlay.close();
    }}
    components={{ DropdownIndicator: null, IndicatorSeparator: null }}
    menuIsOpen={true}
    options={getHotbarSwitchOptions(hotbarStore.hotbars)}
    getOptionLabel={option => {
      if (isActionOption(option)) {
        switch (option.action) {
          case hotbarAddAction:
            return "Add hotbar ...";
          case hotbarRemoveAction:
            return "Remove hotbar ...";
          case hotbarRenameAction:
            return "Rename hotbar ...";
        }
      }

      return hotbarStore.getDisplayLabel(option.hotbar);
    }}
    autoFocus={true}
    escapeClearsValue={false}
    isClearable={false}
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
