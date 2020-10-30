import "./bottom-bar.scss"

import React from "react";
import { observer } from "mobx-react";
import { Icon } from "../icon";
import { WorkspaceMenu } from "../+workspaces/workspace-menu";
import { workspaceStore } from "../../../common/workspace-store";
import { statusBarRegistry } from "../../../extensions/registries";

@observer
export class BottomBar extends React.Component {
  render() {
    const { currentWorkspace } = workspaceStore;
    return (
      <div className="BottomBar flex gaps">
        <div id="current-workspace" className="flex gaps align-center hover-highlight">
          <Icon smallest material="layers"/>
          <span className="workspace-name">{currentWorkspace.name}</span>
        </div>
        <WorkspaceMenu
          htmlFor="current-workspace"
        />
        <div className="extensions box grow flex gaps justify-flex-end">
          {statusBarRegistry.getItems().map(({ item }, index) => {
            if (!item) return;
            return <React.Fragment key={index}>{item}</React.Fragment>
          })}
        </div>
      </div>
    )
  }
}
