import "./workspaces.scss"
import React from "react";
import { ClustersMenu } from "./clusters-menu";
import { WorkspacesBottomBar } from "./bottom-bar";

// todo: support `workspaceId` in URL

export class Workspaces extends React.Component {
  render() {
    return (
      <div className="Workspaces">
        <div className="draggable-top"/>
        <div id="lens-view"/>
        <ClustersMenu/>
        <WorkspacesBottomBar/>
      </div>
    )
  }
}
