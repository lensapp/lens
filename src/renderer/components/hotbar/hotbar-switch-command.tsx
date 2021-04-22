import React from "react";
import { observer } from "mobx-react";
import { Select } from "../select";
import { computed } from "mobx";
import { HotbarStore } from "../../../common/hotbar-store";
import { CommandOverlay } from "../command-palette";
import { HotbarAddCommand } from "./hotbar-add-command";
import { HotbarRemoveCommand } from "./hotbar-remove-command";

@observer
export class HotbarSwitchCommand extends React.Component {
  private static addActionId = "__add__";
  private static removeActionId = "__remove__";

  @computed get options() {
    const hotbarStore = HotbarStore.getInstance();
    const options = hotbarStore.hotbars.map((hotbar) => {
      return { value: hotbar.id, label: hotbar.name };
    });

    options.push({ value: HotbarSwitchCommand.addActionId, label: "Add hotbar ..." });

    if (hotbarStore.hotbars.length > 1) {
      options.push({ value: HotbarSwitchCommand.removeActionId, label: "Remove hotbar ..." });
    }

    return options;
  }

  onChange(idOrAction: string): void {
    switch(idOrAction) {
      case HotbarSwitchCommand.addActionId:
        CommandOverlay.open(<HotbarAddCommand />);

        return;
      case HotbarSwitchCommand.removeActionId:
        CommandOverlay.open(<HotbarRemoveCommand />);

        return;
      default:
        HotbarStore.getInstance().activeHotbarId = idOrAction;
        CommandOverlay.close();
    }
  }

  render() {
    return (
      <Select
        onChange={(v) => this.onChange(v.value)}
        components={{ DropdownIndicator: null, IndicatorSeparator: null }}
        menuIsOpen={true}
        options={this.options}
        autoFocus={true}
        escapeClearsValue={false}
        placeholder="Switch to hotbar" />
    );
  }
}
