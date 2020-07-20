import "./cluster-manager.scss"
import React from "react";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { App } from "../app";
import { ClusterStatus } from "./cluster-status";
import { ClustersMenu } from "./clusters-menu";
import { BottomBar } from "./bottom-bar";
import { cssNames, IClassName } from "../../utils";
import { invokeIpc } from "../../../common/ipc";
import { ClusterIpcChannel } from "../../../main/cluster";
import { clusterStore } from "../../../common/cluster-store";

interface Props {
  className?: IClassName;
  contentClass?: IClassName;
}

@observer
export class ClusterManager extends React.Component<Props> {
  @computed get isReady() {
    return clusterStore.activeCluster?.isReady
  }

  async componentDidMount() {
    await invokeIpc(ClusterIpcChannel.INIT)
    await App.init();
  }

  render() {
    const { className, contentClass } = this.props;
    return (
      <div className={cssNames("ClusterManager", className)}>
        <div id="draggable-top"/>
        <div id="lens-view" className={cssNames("flex", contentClass)}>
          {this.isReady && <App/>}
          {!this.isReady && <ClusterStatus/>}
        </div>
        <ClustersMenu/>
        <BottomBar/>
      </div>
    )
  }
}
