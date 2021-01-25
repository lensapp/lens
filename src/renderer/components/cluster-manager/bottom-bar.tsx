import "./bottom-bar.scss";

import React from "react";
import { observer } from "mobx-react";
import { Icon } from "../icon";
import { workspaceStore } from "../../../common/workspace-store";
import { statusBarRegistry } from "../../../extensions/registries";
import { CommandOverlay } from "../command-palette/command-container";
import { ChooseWorkspace } from "../+workspaces";

@observer
export class BottomBar extends React.Component {
  render() {
    const { currentWorkspace } = workspaceStore;
    // in case .getItems() returns undefined
    const items = statusBarRegistry.getItems() ?? [];

    return (
      <div className="BottomBar flex gaps">
        <div id="current-workspace" data-test-id="current-workspace" className="flex gaps align-center" onClick={() => CommandOverlay.open(<ChooseWorkspace />)}>
          <Icon smallest material="layers"/>
          <span className="workspace-name" data-test-id="current-workspace-name">{currentWorkspace.name}</span>
        </div>
        <div className="extensions box grow flex gaps justify-flex-end">
          {Array.isArray(items) && items.map(({ item }, index) => {
            if (!item) return;

            return (
              <div
                className="flex align-center gaps item"
                key={index}
              >
                {typeof item === "function" ? item() : item}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
