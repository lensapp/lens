import "./bottom-bar.scss"
import React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { Trans } from "@lingui/macro";
import { Icon } from "../icon";
import { Menu, MenuItem } from "../menu";
import { WorkspaceId, workspaceStore } from "../../../common/workspace-store";
import { workspacesURL } from "../+workspaces";

@observer
export class BottomBar extends React.Component {
  @observable menuVisible = false;

  selectWorkspace = (workspaceId: WorkspaceId) => {
    workspaceStore.currentWorkspaceId = workspaceId;
  }

  render() {
    const { currentWorkspace, workspacesList } = workspaceStore;
    const menuId = "workspaces-menu"
    return (
      <div className="BottomBar flex gaps">
        <div id="current-workspace" className="flex gaps align-center box right">
          <Icon small material="layers"/>
          <span className="workspace-name">{currentWorkspace.name}</span>
        </div>
        <Menu
          usePortal
          id="workspace-menu"
          htmlFor="current-workspace"
          isOpen={this.menuVisible}
          open={() => this.menuVisible = true}
          close={() => this.menuVisible = false}
        >
          <Link className="workspaces-title" to={workspacesURL()}>
            <Trans>Workspaces</Trans>
          </Link>
          {workspacesList.map(({ id, name, description }) => {
            return (
              <MenuItem
                key={id}
                active={id === currentWorkspace.id}
                onClick={() => this.selectWorkspace(id)}
                title={description}
              >
                <Icon small material="layers"/>
                <span className="workspace">{name}</span>
              </MenuItem>
            )
          })}
        </Menu>
      </div>
    )
  }
}
