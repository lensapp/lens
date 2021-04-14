import React from "react";
import { observer } from "mobx-react";
import { computed} from "mobx";
import { WorkspaceStore, workspaceStore } from "../../../common/workspace-store";
import { commandRegistry } from "../../../extensions/registries/command-registry";
import { Select, SelectOption } from "../select";
import { navigate } from "../../navigation";
import { CommandOverlay } from "../command-palette/command-container";
import { AddWorkspace } from "./add-workspace";
import { RemoveWorkspace } from "./remove-workspace";
import { EditWorkspace } from "./edit-workspace";
import { landingURL } from "../+landing-page";
import { clusterViewURL } from "../cluster-manager/cluster-view.route";

@observer
export class ChooseWorkspace extends React.Component {
  private static overviewActionId = "__overview__";
  private static addActionId = "__add__";
  private static removeActionId = "__remove__";
  private static editActionId = "__edit__";

  @computed get options() {
    const options: SelectOption<string | symbol>[] = workspaceStore.enabledWorkspacesList.map((workspace) => {
      return { value: workspace.id, label: workspace.name, isDisabled: workspaceStore.isActive(workspace) };
    });

    options.push({ value: ChooseWorkspace.overviewActionId, label: "Show current workspace overview ..." });

    options.push({ value: ChooseWorkspace.addActionId, label: "Add workspace ..." });

    if (options.length > 1) {
      options.push({ value: ChooseWorkspace.removeActionId, label: "Remove workspace ..." });

      if (workspaceStore.currentWorkspace.id !== WorkspaceStore.defaultId) {
        options.push({ value: ChooseWorkspace.editActionId, label: "Edit current workspace ..." });
      }
    }

    return options;
  }

  onChange(idOrAction: string): void {
    switch (idOrAction) {
      case ChooseWorkspace.overviewActionId:
        navigate(landingURL()); // overview of active workspace. TODO: change name from landing

        return CommandOverlay.close();
      case ChooseWorkspace.addActionId:
        return CommandOverlay.open(<AddWorkspace />);
      case ChooseWorkspace.removeActionId:
        return CommandOverlay.open(<RemoveWorkspace />);
      case ChooseWorkspace.editActionId:
        return CommandOverlay.open(<EditWorkspace />);
      default: // assume id
        workspaceStore.setActive(idOrAction);
        const clusterId = workspaceStore.getById(idOrAction).activeClusterId;

        if (clusterId) {
          navigate(clusterViewURL({ params: { clusterId } }));
        } else {
          navigate(landingURL());
        }

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
