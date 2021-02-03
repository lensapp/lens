import React from "react";
import { observer } from "mobx-react";
import { computed} from "mobx";
import { WorkspaceStore, workspaceStore } from "../../../common/workspace-store";
import { commandRegistry } from "../../../extensions/registries/command-registry";
import { Select } from "../select";
import { navigate } from "../../navigation";
import { CommandOverlay } from "../command-palette/command-container";
import { AddWorkspace } from "./add-workspace";
import { RemoveWorkspace } from "./remove-workspace";
import { EditWorkspace } from "./edit-workspace";
import { landingURL } from "../+landing-page";
import { clusterViewURL } from "../cluster-manager/cluster-view.route";

@observer
export class ChooseWorkspace extends React.Component {
  private static addActionId = "__add__";
  private static removeActionId = "__remove__";
  private static editActionId = "__edit__";

  @computed get options() {
    const options = workspaceStore.enabledWorkspacesList.map((workspace) => {
      return { value: workspace.id, label: workspace.name };
    });

    options.push({ value: ChooseWorkspace.addActionId, label: "Add workspace ..." });

    if (options.length > 1) {
      options.push({ value: ChooseWorkspace.removeActionId, label: "Remove workspace ..." });

      if (workspaceStore.currentWorkspace.id !== WorkspaceStore.defaultId) {
        options.push({ value: ChooseWorkspace.editActionId, label: "Edit current workspace ..." });
      }
    }

    return options;
  }

  onChange(id: string) {
    if (id === ChooseWorkspace.addActionId) {
      CommandOverlay.open(<AddWorkspace />);

      return;
    }

    if (id === ChooseWorkspace.removeActionId) {
      CommandOverlay.open(<RemoveWorkspace />);

      return;
    }

    if (id === ChooseWorkspace.editActionId) {
      CommandOverlay.open(<EditWorkspace />);

      return;
    }

    workspaceStore.setActive(id);
    const clusterId = workspaceStore.getById(id).lastActiveClusterId;

    if (clusterId) {
      navigate(clusterViewURL({ params: { clusterId } }));
    } else {
      navigate(landingURL());
    }

    CommandOverlay.close();
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
        placeholder="Switch to workspace" />
    );
  }
}

commandRegistry.add({
  id: "workspace.chooseWorkspace",
  title: "Workspace: Switch to workspace ...",
  scope: "global",
  action: () => CommandOverlay.open(<ChooseWorkspace />)
});
