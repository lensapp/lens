
import { Select } from "../select";
import { computed, observable, toJS } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { commandRegistry } from "../../../extensions/registries/command-registry";
import { workspaceStore } from "../../../common/workspace-store";
import { CommandOverlay } from "./command-container";
import { broadcastMessage } from "../../../common/ipc";
import { navigate } from "../../navigation";
import { clusterViewURL } from "../cluster-manager/cluster-view.route";

@observer
export class CommandDialog extends React.Component {
  @observable menuIsOpen = true;

  @computed get options() {
    const activeCluster = workspaceStore.currentWorkspace.activeCluster;

    return commandRegistry.getItems()
      .filter(command => {
        if (command.scope === "cluster" && !activeCluster) {
          return false;
        }

        if (!command.isActive) {
          return true;
        }

        try {
          return command.isActive({
            cluster: activeCluster,
            workspace: workspaceStore.currentWorkspace
          });
        } catch(e) {
          console.error(e);

          return false;
        }
      })
      .map(({ id, title }) => ({ value: id, label: title }))
      .sort((a, b) => a.label > b.label ? 1 : -1);
  }

  private onChange(value: string) {
    const command = commandRegistry.getItems().find((cmd) => cmd.id === value);

    if (!command) {
      return;
    }

    const activeCluster = workspaceStore.currentWorkspace.activeCluster;
    const action = toJS(command.action);

    try {
      CommandOverlay.close();

      if (command.scope === "global") {
        action({
          cluster: activeCluster,
          workspace: workspaceStore.currentWorkspace
        });
      } else if(activeCluster) {
        navigate(clusterViewURL({
          params: {
            clusterId: activeCluster.id
          }
        }));
        broadcastMessage(`command-palette:run-action:${activeCluster.id}`, command.id);
      }
    } catch(error) {
      console.error("[COMMAND-DIALOG] failed to execute command", command.id, error);
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
        data-test-id="command-palette-search"
        placeholder="" />
    );
  }
}
