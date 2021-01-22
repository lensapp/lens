import React from "react";
import { observer } from "mobx-react";
import { computed} from "mobx";
import { workspaceStore } from "../../../common/workspace-store";
import { commandRegistry } from "../../../extensions/registries/command-registry";
import { Select } from "../select";
import { navigate } from "../../navigation";
import { closeCommandDialog, openCommandDialog } from "../command-palette/command-container";
import { AddWorkspace } from "./add-workspace";
import { RemoveWorkspace } from "./remove-workspace";

@observer
export class ChooseWorkspace extends React.Component {
  private static addActionId = "__add__";
  private static removeActionId = "__remove__";

  @computed get options() {
    const options = workspaceStore.enabledWorkspacesList.map((workspace) => {
      return { value: workspace.id, label: workspace.name };
    });

    options.push({ value: ChooseWorkspace.addActionId, label: "Add workspace ..." });

    if (options.length > 1) {
      options.push({ value: ChooseWorkspace.removeActionId, label: "Remove workspace ..." });
    }

    return options;
  }

  onChange(id: string) {
    if (id === ChooseWorkspace.addActionId) {
      openCommandDialog(<AddWorkspace />);

      return;
    }

    if (id === ChooseWorkspace.removeActionId) {
      openCommandDialog(<RemoveWorkspace />);

      return;
    }

    workspaceStore.setActive(id);
    navigate("/");
    closeCommandDialog();
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
  action: () => openCommandDialog(<ChooseWorkspace />)
});
