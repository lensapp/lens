import "./cluster-manager.scss"
import React from "react";
import { ClustersMenu } from "./clusters-menu";
import { BottomBar } from "./bottom-bar";
import { App } from "../app";

export class ClusterManager extends React.Component {
  render() {
    return (
      <div className="ClusterManager">
        <div id="draggable-top"/>
        <div id="lens-view">
          <App/>
        </div>
        <ClustersMenu/>
        <BottomBar/>
      </div>
    )
  }
}
