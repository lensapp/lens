import "./cluster-status.scss"
import React from "react";
import type { KubeAuthProxyResponse } from "../../../main/kube-auth-proxy";
import { ClusterIpcChannel } from "../../../main/cluster";
import { invokeIpc } from "../../../common/ipc";
import { clusterStore } from "../../../common/cluster-store";
import { ipcRenderer } from "electron";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Icon } from "../icon";
import { Button } from "../button";
import { cssNames } from "../../utils";

@observer
export class ClusterStatus extends React.Component {
  @observable authOutput: string[] = [];

  get cluster() {
    return clusterStore.activeCluster;
  }

  get clusterId() {
    return clusterStore.activeClusterId;
  }

  componentDidMount() {
    this.authOutput = ["Connecting ...\n"];
    ipcRenderer.on(`kube-auth:${this.clusterId}`, (evt, { data, stream }: KubeAuthProxyResponse) => {
      this.authOutput.push(`[${stream}]: ${data}`);
    })
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(`kube-auth:${this.clusterId}`);
  }

  reconnect = () => {
    this.authOutput = ["Reconnecting ...\n"];
    invokeIpc(ClusterIpcChannel.RECONNECT, this.clusterId);
  }

  render() {
    const { authOutput, cluster } = this;
    const isError = cluster?.accessible === false;
    return (
      <div className="ClusterStatus flex column gaps">
        {!isError && <Icon material="cloud_queue"/>}
        {isError && <Icon material="cloud_off" className="error"/>}
        <h2>{cluster?.contextName}</h2>
        <pre className="kube-auth-out">
          {authOutput.map((data, index) => {
            const error = data.startsWith("[stderr]");
            return <p key={index} className={cssNames({ error })}>{data}</p>
          })}
        </pre>
        {isError && (
          <Button
            primary className="box center"
            label="Reconnect"
            onClick={this.reconnect}
          />
        )}
      </div>
    )
  }
}
