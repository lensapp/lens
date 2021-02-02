import React from "react";
import { observer } from "mobx-react";
import { Workspace, workspaceStore } from "../../../common/workspace-store";
import { v4 as uuid } from "uuid";
import { commandRegistry } from "../../../extensions/registries/command-registry";
import { Input, InputValidator } from "../input";
import { navigate } from "../../navigation";
import { CommandOverlay } from "../command-palette/command-container";
import { landingURL } from "../+landing-page";
import { clusterStore } from "../../../common/cluster-store";

const uniqueWorkspaceName: InputValidator = {
  condition: ({ required }) => required,
  message: () => `Workspace with this name already exists`,
  validate: value => !workspaceStore.getByName(value),
};

@observer
export class AddWorkspace extends React.Component {
  onSubmit(name: string) {
    if (!name.trim()) {
      return;
    }
    const workspace = workspaceStore.addWorkspace(new Workspace({
      id: uuid(),
      name
    }));

    if (!workspace) {
      return;
    }

    workspaceStore.setActive(workspace.id);
    clusterStore.setActive(null);
    navigate(landingURL());
    CommandOverlay.close();
  }

  render() {
    return (
      <>
        <Input
          placeholder="Workspace name"
          autoFocus={true}
          theme="round-black"
          data-test-id="command-palette-workspace-add-name"
          validators={[uniqueWorkspaceName]}
          onSubmit={(v) => this.onSubmit(v)}
          dirty={true}
          showValidationLine={true} />
        <small className="hint">
          Please provide a new workspace name (Press &quot;Enter&quot; to confirm or &quot;Escape&quot; to cancel)
        </small>
      </>
    );
  }
}

commandRegistry.add({
  id: "workspace.addWorkspace",
  title: "Workspace: Add workspace ...",
  scope: "global",
  action: () => CommandOverlay.open(<AddWorkspace />)
});
