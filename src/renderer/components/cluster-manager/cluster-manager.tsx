import "./cluster-manager.scss"
import React from "react";
import { observer } from "mobx-react";
import { computed, observable } from "mobx";
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
  @observable appReady = false;

  @computed get clusterReady() {
    return clusterStore.activeCluster?.isReady
  }

  async componentDidMount() {
    invokeIpc(ClusterIpcChannel.INIT);
    await App.init();
    this.appReady = true;
  }

  render() {
    const { className, contentClass } = this.props;
    const isReady = this.appReady && this.clusterReady;
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
