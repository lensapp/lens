import React from "react";
import { observer } from "mobx-react";
import { computed} from "mobx";
import { WorkspaceStore, workspaceStore } from "../../../common/workspace-store";
import { ConfirmDialog } from "../confirm-dialog";
import { commandRegistry } from "../../../extensions/registries/command-registry";
import { Select } from "../select";
import { CommandOverlay } from "../command-palette/command-container";

@observer
export class RemoveWorkspace extends React.Component {
  @computed get options() {
    return workspaceStore.enabledWorkspacesList.filter((workspace) => workspace.id !== WorkspaceStore.defaultId).map((workspace) => {
      return { value: workspace.id, label: workspace.name };
    });
  }

  onChange(id: string) {
    const workspace = workspaceStore.enabledWorkspacesList.find((workspace) => workspace.id === id);

    if (!workspace ) {
      return;
    }

    CommandOverlay.close();
    ConfirmDialog.open({
      okButtonProps: {
        label: `Remove Workspace`,
        primary: false,
        accent: true,
      },
      ok: () => {
        workspaceStore.removeWorkspace(workspace);
      },
      message: (
        <div className="confirm flex column gaps">
          <p>
            Are you sure you want remove workspace <b>{workspace.name}</b>?
          </p>
          <p className="info">
            All clusters within workspace will be cleared as well
          </p>
        </div>
      ),
    });
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
        data-test-id="command-palette-workspace-remove-select"
        placeholder="Remove workspace" />
    );
  }
}

commandRegistry.add({
  id: "workspace.removeWorkspace",
  title: "Workspace: Remove workspace ...",
  scope: "global",
  action: () => CommandOverlay.open(<RemoveWorkspace />)
});
