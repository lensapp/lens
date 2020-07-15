import "./cluster-manager.scss"
import React from "react";
import { ClustersMenu } from "./clusters-menu";
import { BottomBar } from "./bottom-bar";

export class ClusterManager extends React.Component {
  render() {
    const { children: lensView } = this.props;
    return (
      <div className="ClusterManager">
        <div id="draggable-top"/>
        <div id="lens-view">{lensView}</div>
        <ClustersMenu/>
        <BottomBar/>
      </div>
    )
  }
}
