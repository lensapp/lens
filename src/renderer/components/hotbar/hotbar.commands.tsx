import React from "react";
import { commandRegistry } from "../../../extensions/registries";
import { CommandOverlay } from "../command-palette";
import { HotbarAddCommand } from "./hotbar-add-command";
import { HotbarRemoveCommand } from "./hotbar-remove-command";
import { HotbarSwitchCommand } from "./hotbar-switch-command";

commandRegistry.add({
  id: "hotbar.switchHotbar",
  title: "Hotbar: Switch ...",
  scope: "global",
  action: () => CommandOverlay.open(<HotbarSwitchCommand />)
});

commandRegistry.add({
  id: "hotbar.addHotbar",
  title: "Hotbar: Add Hotbar ...",
  scope: "global",
  action: () => CommandOverlay.open(<HotbarAddCommand />)
});

commandRegistry.add({
  id: "hotbar.removeHotbar",
  title: "Hotbar: Remove Hotbar ...",
  scope: "global",
  action: () => CommandOverlay.open(<HotbarRemoveCommand />)
});
