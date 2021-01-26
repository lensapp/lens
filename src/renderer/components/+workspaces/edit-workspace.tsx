import React from "react";
import { observer } from "mobx-react";
import { WorkspaceStore, workspaceStore } from "../../../common/workspace-store";
import { commandRegistry } from "../../../extensions/registries/command-registry";
import { Input, InputValidator } from "../input";
import { CommandOverlay } from "../command-palette/command-container";

const validateWorkspaceName: InputValidator = {
  condition: ({ required }) => required,
  message: () => `Workspace with this name already exists`,
  validate: (value) => {
    const current = workspaceStore.currentWorkspace;

    if (current.name === value.trim()) {
      return true;
    }

    return !workspaceStore.enabledWorkspacesList.find((workspace) => workspace.name === value);
  }
};

interface EditWorkspaceState {
  name: string;
}

@observer
export class EditWorkspace extends React.Component<{}, EditWorkspaceState> {

  state: EditWorkspaceState = {
    name: ""
  };

  componentDidMount() {
    this.setState({name: workspaceStore.currentWorkspace.name});
  }

  onSubmit(name: string) {
    if (name.trim() === "") {
      return;
    }

    workspaceStore.currentWorkspace.name = name;
    CommandOverlay.close();
  }

  onChange(name: string) {
    this.setState({name});
  }

  get name() {
    return this.state.name;
  }

  render() {
    return (
      <>
        <Input
          placeholder="Workspace name"
          autoFocus={true}
          theme="round-black"
          data-test-id="command-palette-workspace-add-name"
          validators={[validateWorkspaceName]}
          onChange={(v) => this.onChange(v)}
          onSubmit={(v) => this.onSubmit(v)}
          dirty={true}
          value={this.name}
          showValidationLine={true} />
        <small className="hint">
          Please provide a new workspace name (Press &quot;Enter&quot; to confirm or &quot;Escape&quot; to cancel)
        </small>
      </>
    );
  }
}

commandRegistry.add({
  id: "workspace.editCurrentWorkspace",
  title: "Workspace: Edit current workspace ...",
  scope: "global",
  action: () => CommandOverlay.open(<EditWorkspace />),
  isActive: (context) => context.workspace?.id !== WorkspaceStore.defaultId
});
