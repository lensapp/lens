import "./bottom-bar.scss"
import React from "react";
import { observer } from "mobx-react";
import { Icon } from "../icon";
import { WorkspaceMenu } from "../+workspaces/workspace-menu";
import { workspaceStore } from "../../../common/workspace-store";

import { supportURL } from "../+support/support.route";
import { navigate } from "../../navigation";

@observer
export class BottomBar extends React.Component {
  render() {
    const { currentWorkspace } = workspaceStore;
    return (
      <div className="BottomBar flex gaps">
        <div id="current-workspace" className="flex gaps align-center box">
          <Icon small material="layers"/>
          <span className="workspace-name">{currentWorkspace.name}</span>
        </div>
        <WorkspaceMenu htmlFor="current-workspace"/>
        <div id="support" className="flex gaps align-center box right">
          <Icon 
            small
            svg="support"
            onClick={() => navigate(supportURL())}
          />
        </div>
      </div>
    )
  }
}
