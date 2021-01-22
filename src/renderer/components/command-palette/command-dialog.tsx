
import { Select } from "../select";
import { computed, observable, toJS } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { commandRegistry } from "../../../extensions/registries/command-registry";
import { clusterStore } from "../../../common/cluster-store";
import { workspaceStore } from "../../../common/workspace-store";
import { closeCommandDialog } from "./command-container";
import { broadcastMessage } from "../../../common/ipc";

@observer
export class CommandDialog extends React.Component {
  @observable menuIsOpen = true;

  @computed get options() {
    const context = {
      cluster: clusterStore.active,
      workspace: workspaceStore.currentWorkspace
    };

    return commandRegistry.getItems().filter((command) => {
      if (command.scope === "cluster" && !clusterStore.active) {
        return false;
      }

      if (!command.isActive) {
        return true;
      }

      try {
        return command.isActive(context);
      } catch(e) {
        console.error(e);

        return false;
      }
    }).map((command) => {
      return { value: command.id, label: command.title };
    }).sort((a, b) => a.label > b.label ? 1 : -1);
  }

  private onChange(value: string) {
    const command = commandRegistry.getItems().find((cmd) => cmd.id === value);

    if (!command) {
      return;
    }

    const action = toJS(command.action);

    try {
      closeCommandDialog();

      if (command.scope === "global") {
        action({
          cluster: clusterStore.active,
          workspace: workspaceStore.currentWorkspace
        });
      } else if(clusterStore.active) {
        broadcastMessage(`command-palette:run-action:${clusterStore.active.id}`, command.id);
      }
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
