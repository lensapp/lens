import "./bottom-bar.scss"

import React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { Trans } from "@lingui/macro";
import { Icon } from "../icon";
import { Menu, MenuItem } from "../menu";
import { prevDefault } from "../../utils";
import { workspaceStore } from "../../../common/workspace-store";

// todo: remove dummy actions + console.log

@observer
export class WorkspacesBottomBar extends React.Component {
  @observable menuVisible = false;

  render() {
    const { currentWorkspace, workspacesList } = workspaceStore;
    return (
      <div className="WorkspacesBottomBar flex gaps">
        <div id="workspace" className="workspace flex align-center box right">
          <Icon small material="layers"/> {currentWorkspace}
        </div>
        <Menu
          usePortal
          htmlFor="workspace"
          className="WorkspacesMenu"
          isOpen={this.menuVisible}
          open={() => this.menuVisible = true}
          close={() => this.menuVisible = false}
        >
          <Link
            to="/workspaces"
            className="workspaces-title"
            onClick={prevDefault(() => console.log('/navigate: workspaces page'))}>
            <Trans>Workspaces</Trans>
          </Link>
          {workspacesList.map(workspace => {
            const { id, name, description } = workspace;
            return (
              <MenuItem key={id} onClick={() => console.log(`navigate: /workspaces/${id}`)} title={description}>
                <Icon small material="layers"/> {name}
              </MenuItem>
            )
          })}
        </Menu>
      </div>
    )
  }
}
