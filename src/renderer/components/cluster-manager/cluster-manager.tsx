import "./cluster-manager.scss"
import React from "react";
import { observer } from "mobx-react";
import { observable } from "mobx";
import { App } from "../app";
import { ClusterStatus } from "./cluster-status";
import { ClustersMenu } from "./clusters-menu";
import { BottomBar } from "./bottom-bar";
import { cssNames, IClassName } from "../../utils";
import { clusterStore } from "../../../common/cluster-store";
import { clusterIpc } from "../../../common/cluster-ipc";

interface Props {
  className?: IClassName;
  contentClass?: IClassName;
}

@observer
export class ClusterManager extends React.Component<Props> {
  @observable isReady = false;

  async componentDidMount() {
    clusterIpc.refresh.invokeFromRenderer();
    await App.init();
    this.isReady = true;
  }

  render() {
    const { className, contentClass } = this.props;
    const isReady = this.isReady && clusterStore.activeCluster?.isReady;
    return (
      <div className={cssNames("ClusterManager", className)}>
        <div id="draggable-top"/>
        <div id="lens-view" className={cssNames("flex column", contentClass)}>
          {isReady && <App/>}
          {!isReady && <ClusterStatus/>}
        </div>
        <ClustersMenu/>
        <BottomBar/>
      </div>
    )
  }
}
