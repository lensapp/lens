import "./workspace-menu.scss"
import React from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { workspacesURL } from "./workspaces.route";
import { Trans } from "@lingui/macro";
import { Menu, MenuItem, MenuProps } from "../menu";
import { Icon } from "../icon";
import { observable } from "mobx";
import { workspaceStore, WorkspaceId } from "../../../common/workspace-store";
import { cssNames } from "../../utils";
import { clusterStore } from "../../../common/cluster-store";

interface Props extends Partial<MenuProps> {
}

@observer
export class WorkspaceMenu extends React.Component<Props> {
  @observable menuVisible = false;

  activateWorkspace = (id: WorkspaceId) => {
    if (clusterStore.activeClusterId) {
      workspaceStore.setLastActiveClusterId(workspaceStore.currentWorkspace.id, clusterStore.activeClusterId);
    }
    workspaceStore.setActive(id);
  }

  render() {
    const { className, ...menuProps } = this.props;
    const { workspacesList, currentWorkspace } = workspaceStore;
    return (
      <Menu
        {...menuProps}
        usePortal
        className={cssNames("WorkspaceMenu", className)}
        isOpen={this.menuVisible}
        open={() => this.menuVisible = true}
        close={() => this.menuVisible = false}
      >
        <Link className="workspaces-title" to={workspacesURL()}>
          <Trans>Workspaces</Trans>
        </Link>
        {workspacesList.map(({ id: workspaceId, name, description }) => {
          return (
            <MenuItem
              key={workspaceId}
              title={description}
              active={workspaceId === currentWorkspace.id}
              onClick={() => this.activateWorkspace(workspaceId)}
            >
              <Icon small material="layers"/>
              <span className="workspace">{name}</span>
            </MenuItem>
          )
        })}
      </Menu>
    )
  }
}
