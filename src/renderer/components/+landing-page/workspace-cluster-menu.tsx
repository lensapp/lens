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
  settings() {
    const { clusterItem } = this.props;

    navigate(clusterSettingsURL({
      params: {
        clusterId: clusterItem.getId()
      }
    }));
  }

  @autobind()
  renderRemoveMessage() {
    const { clusterItem, workspace } = this.props;

    return (
      <p>Remove cluster <b>{clusterItem.getName()}</b> from workspace {workspace.name}?</p>
    );
  }


  renderContent() {
    const { toolbar } = this.props;

    return (
      <>
        {
          <MenuItem onClick={this.settings}>
            <Icon material="settings" interactive={toolbar} title={`Settings`}/>
            <span className="title">Settings</span>
          </MenuItem>
        }
      </>
    );
  }

  render() {
    const { clusterItem, className, ...menuProps } = this.props;

    return (
      <MenuActions
        {...menuProps}
        className={cssNames("WorkspaceClusterMenu", className)}
        removeAction={clusterItem.cluster.isManaged ? null : this.remove}
        removeConfirmationMessage={this.renderRemoveMessage}
      >
        {this.renderContent()}
      </MenuActions>
    );
  }
}
