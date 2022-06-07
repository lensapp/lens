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
        hotbarStore.setActiveHotbar(option.value);
        commandOverlay.close();
      }
    }}
    components={{ DropdownIndicator: null, IndicatorSeparator: null }}
    menuIsOpen={true}
    options={[
      ...hotbarStore.hotbars.map(hotbar => ({
        value: hotbar,
        label: hotbarStore.getDisplayLabel(hotbar),
      })),
      {
        value: hotbarAddAction,
        label: "Add hotbar ...",
      },
      ...ignoreIf(hotbarStore.hotbars.length > 1, [
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
    hotbarStore: di.inject(hotbarStoreInjectable),
    commandOverlay: di.inject(commandOverlayInjectable),
    ...props,
  }),
});
