import React from "react";
import { ClusterItem, WorkspaceClusterStore } from "./workspace-cluster.store";
import { autobind, cssNames } from "../../utils";
import { MenuActions, MenuActionsProps } from "../menu/menu-actions";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { Workspace } from "../../../common/workspace-store";
import { clusterSettingsURL } from "../+cluster-settings";
import { navigate } from "../../navigation";

interface Props extends MenuActionsProps {
  clusterItem: ClusterItem;
  workspace: Workspace;
  workspaceClusterStore: WorkspaceClusterStore;
}

export class WorkspaceClusterMenu extends React.Component<Props> {

  @autobind()
  remove() {
    const { clusterItem, workspaceClusterStore } = this.props;
    
    return workspaceClusterStore.remove(clusterItem);
  }

  @autobind()
  gotoSettings() {
    const { clusterItem } = this.props;

    navigate(clusterSettingsURL({
      params: {
        clusterId: clusterItem.id
      }
    }));
  }

  @autobind()
  renderRemoveMessage() {
    const { clusterItem, workspace } = this.props;

    return (
      <p>Remove cluster <b>{clusterItem.name}</b> from workspace <b>{workspace.name}</b>?</p>
    );
  }


  renderContent() {
    const { toolbar } = this.props;

    return (
      <>
        <MenuItem onClick={this.gotoSettings}>
          <Icon material="settings" interactive={toolbar} title="Settings"/>
          <span className="title">Settings</span>
        </MenuItem>
      </>
    );
  }

  render() {
    const { clusterItem: { cluster: { isManaged } }, className, ...menuProps } = this.props;

    return (
      <MenuActions
        {...menuProps}
        className={cssNames("WorkspaceClusterMenu", className)}
        removeAction={isManaged ? null : this.remove}
        removeConfirmationMessage={this.renderRemoveMessage}
      >
        {this.renderContent()}
      </MenuActions>
    );
  }
}
