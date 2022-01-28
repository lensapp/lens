/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { Select } from "../select";
import hotbarStoreInjectable from "../../../common/hotbar-store/store.injectable";
import type { CommandOverlay } from "../command-palette";
import { HotbarAddCommand } from "./hotbar-add-command";
import { HotbarRemoveCommand } from "./hotbar-remove-command";
import { HotbarRenameCommand } from "./hotbar-rename-command";
import type { Hotbar } from "../../../common/hotbar-store/hotbar";
import { withInjectables } from "@ogre-tools/injectable-react";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";

const addActionId = "__add__";
const removeActionId = "__remove__";
const renameActionId = "__rename__";

interface HotbarManager {
  hotbars: Hotbar[];
  setActiveHotbar: (id: string) => void;
  getDisplayLabel: (hotbar: Hotbar) => string;
}

interface Dependencies {
  hotbarManager: HotbarManager
  commandOverlay: CommandOverlay;
}

function getHotbarSwitchOptions(hotbarManager: HotbarManager) {
  const options = hotbarManager.hotbars.map(hotbar => ({
    value: hotbar.id,
    label: hotbarManager.getDisplayLabel(hotbar),
  }));

  options.push({ value: addActionId, label: "Add hotbar ..." });

  if (hotbarManager.hotbars.length > 1) {
    options.push({ value: removeActionId, label: "Remove hotbar ..." });
  }

  options.push({ value: renameActionId, label: "Rename hotbar ..." });

  return options;
}

const NonInjectedHotbarSwitchCommand = observer(({ hotbarManager, commandOverlay }: Dependencies) => {
  const options = getHotbarSwitchOptions(hotbarManager);

  const onChange = (idOrAction: string): void  => {
    switch (idOrAction) {
      case addActionId:
        return commandOverlay.open(<HotbarAddCommand />);
      case removeActionId:
        return commandOverlay.open(<HotbarRemoveCommand />);
      case renameActionId:
        return commandOverlay.open(<HotbarRenameCommand />);
      default:
        hotbarManager.setActiveHotbar(idOrAction);
        commandOverlay.close();
    }
  };

  return (
    <Select
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
    hotbarManager: di.inject(hotbarStoreInjectable),
    commandOverlay: di.inject(commandOverlayInjectable),
    ...props,
  }),
});
