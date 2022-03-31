/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { Select } from "../select";
import hotbarStoreInjectable from "../../../common/hotbar-store.injectable";
import type { CommandOverlay } from "../command-palette";
import { HotbarAddCommand } from "./hotbar-add-command";
import { HotbarRemoveCommand } from "./hotbar-remove-command";
import { HotbarRenameCommand } from "./hotbar-rename-command";
import { withInjectables } from "@ogre-tools/injectable-react";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";
import type { HotbarStore } from "../../../common/hotbar-store";

const addActionId = "__add__";
const removeActionId = "__remove__";
const renameActionId = "__rename__";

interface Dependencies {
  hotbarStore: HotbarStore;
  commandOverlay: CommandOverlay;
}

function getHotbarSwitchOptions(hotbarStore: HotbarStore) {
  const options = hotbarStore.hotbars.map(hotbar => ({
    value: hotbar.id,
    label: hotbarStore.getDisplayLabel(hotbar),
  }));

  options.push({ value: addActionId, label: "Add hotbar ..." });

  if (hotbarStore.hotbars.length > 1) {
    options.push({ value: removeActionId, label: "Remove hotbar ..." });
  }

  options.push({ value: renameActionId, label: "Rename hotbar ..." });

  return options;
}

const NonInjectedHotbarSwitchCommand = observer(({ hotbarStore, commandOverlay }: Dependencies) => {
  const options = getHotbarSwitchOptions(hotbarStore);

  const onChange = (idOrAction: string): void  => {
    switch (idOrAction) {
      case addActionId:
        return commandOverlay.open(<HotbarAddCommand />);
      case removeActionId:
        return commandOverlay.open(<HotbarRemoveCommand />);
      case renameActionId:
        return commandOverlay.open(<HotbarRenameCommand />);
      default:
        hotbarStore.setActiveHotbar(idOrAction);
        commandOverlay.close();
    }
  };

  return (
    <Select
      id="switch-to-hotbar-input"
      menuPortalTarget={null}
      onChange={(v) => onChange(v.value)}
      components={{ DropdownIndicator: null, IndicatorSeparator: null }}
      menuIsOpen={true}
      options={options}
      autoFocus={true}
      escapeClearsValue={false}
      placeholder="Switch to hotbar"
    />
  );
});

export const HotbarSwitchCommand = withInjectables<Dependencies>(NonInjectedHotbarSwitchCommand, {
  getProps: (di, props) => ({
    hotbarStore: di.inject(hotbarStoreInjectable),
    commandOverlay: di.inject(commandOverlayInjectable),
    ...props,
  }),
});
