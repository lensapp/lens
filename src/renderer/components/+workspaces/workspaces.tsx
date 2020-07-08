import "./workspaces.scss"
import React from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { Trans } from "@lingui/macro";
import { workspaceStore } from "../../../common/workspace-store";
import { Icon } from "../icon";
import { ClustersMenu } from "./clusters-menu";
import { Menu, MenuItem } from "../menu";
import { prevDefault } from "../../utils";
import { observable } from "mobx";

// todo: support `workspaceId` in URL

@observer
export class Workspaces extends React.Component {
  @observable menuVisible = false;

  render() {
    const { currentWorkspace, workspaces } = workspaceStore;
    return (
      <div className="Workspaces">
        <div className="draggable-top"/>

        <ClustersMenu/>

        <div className="lens-container">
          {/*todo: replace with BrowserView */}
        </div>

        <div className="bottom-bar flex justify-flex-end">
          <div id="workspace" className="workspace flex align-center">
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
            {Array.from(workspaces.values()).map(workspace => {
              const { id, name, description } = workspace;
              return (
                <MenuItem key={id} onClick={() => console.log(`navigate: /workspaces/${id}`)} title={description}>
                  <Icon small material="layers"/> {name}
                </MenuItem>
              )
            })}
          </Menu>
        </div>
      </div>
    )
  }
}
