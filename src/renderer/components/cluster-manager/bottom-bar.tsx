import "./bottom-bar.scss";

import React from "react";
import { observer } from "mobx-react";
import { Icon } from "../icon";
import { workspaceStore } from "../../../common/workspace-store";
import { StatusBarRegistration, statusBarRegistry } from "../../../extensions/registries";
import { CommandOverlay } from "../command-palette/command-container";
import { ChooseWorkspace } from "../+workspaces";

@observer
export class BottomBar extends React.Component {
  renderRegisteredItem(registration: StatusBarRegistration) {
    const { item } = registration;

    if (item) {
      return typeof item === "function" ? item() : item;
    }

    return <registration.components.Item />;
  }

  renderRegisteredItems() {
    const items = statusBarRegistry.getItems();

    if (!Array.isArray(items)) {
      return;
    }

    return (
      <div className="extensions box grow flex gaps justify-flex-end">
        {items.map((registration, index) => {
          if (!registration?.item && !registration?.components?.Item) {
            return;
          }

          return (
            <div className="flex align-center gaps item" key={index}>
              {this.renderRegisteredItem(registration)}
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    const { currentWorkspace } = workspaceStore;

    return (
      <div className="BottomBar flex gaps">
        <div id="current-workspace" data-test-id="current-workspace" className="flex gaps align-center" onClick={() => CommandOverlay.open(<ChooseWorkspace />)}>
          <Icon smallest material="layers"/>
          <span className="workspace-name" data-test-id="current-workspace-name">{currentWorkspace.name}</span>
        </div>
        {this.renderRegisteredItems()}
      </div>
    );
  }
}
