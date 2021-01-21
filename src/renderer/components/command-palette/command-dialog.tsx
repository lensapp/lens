
import { Select } from "../select";
import { computed, observable, toJS } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { commandRegistry } from "../../../extensions/registries/command-registry";
import { clusterStore } from "../../../common/cluster-store";
import { workspaceStore } from "../../../common/workspace-store";
import { closeCommandDialog } from "./command-container";

@observer
export class CommandDialog extends React.Component {
  @observable menuIsOpen = true;

  @computed get options() {
    return commandRegistry.getItems().map((command) => {
      return { value: command.id, label: command.title };
    });
  }

  private onChange(value: string) {
    const command = commandRegistry.getItems().find((cmd) => cmd.id === value);

    if (!command) {
      return;
    }

    const action = toJS(command.action);

    try {
      closeCommandDialog();
      action({
        cluster: clusterStore.active,
        workspace: workspaceStore.currentWorkspace
      });
    } catch(error) {
      console.error("failed to execute command", command.id, error);
    }
  }

  render() {
    return (
      <Select
        onChange={(v) => this.onChange(v.value)}
        components={{ DropdownIndicator: null, IndicatorSeparator: null }}
        menuIsOpen={this.menuIsOpen}
        options={this.options}
        autoFocus={true}
        escapeClearsValue={false}
        placeholder="" />
    );
  }
}
