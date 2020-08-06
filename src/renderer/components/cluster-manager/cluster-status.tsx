import type { KubeAuthProxyLog } from "../../../main/kube-auth-proxy";

import "./cluster-status.scss"
import React from "react";
import { observer } from "mobx-react";
import { ipcRenderer } from "electron";
import { computed, observable } from "mobx";
import { clusterIpc } from "../../../common/cluster-ipc";
import { Icon } from "../icon";
import { Button } from "../button";
import { cssNames } from "../../utils";
import { Cluster } from "../../../main/cluster";
import { ClusterId, clusterStore } from "../../../common/cluster-store";

interface Props {
  clusterId: ClusterId;
}

@observer
export class ClusterStatus extends React.Component<Props> {
  @observable authOutput: KubeAuthProxyLog[] = [];
  @observable isReconnecting = false;

  @computed get clusterId() {
    return this.props.clusterId;
  }

  @computed get cluster(): Cluster {
    return clusterStore.getById(this.clusterId);
  }

  @computed get hasErrors(): boolean {
    return this.authOutput.some(({ error }) => error) || !!this.cluster.failureReason;
  }

  async componentDidMount() {
    if (this.cluster.disconnected) {
      return;
    }
    this.authOutput = [{ data: "Connecting..." }];
    ipcRenderer.on(`kube-auth:${this.cluster.id}`, (evt, res: KubeAuthProxyLog) => {
      this.authOutput.push({
        data: res.data.trimRight(),
        error: res.error,
      });
    })
    await this.refreshClusterState();
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(`kube-auth:${this.clusterId}`);
  }

  async refreshClusterState() {
    return clusterIpc.activate.invokeFromRenderer(this.clusterId);
  }

  reconnect = async () => {
    this.authOutput = [{ data: "Reconnecting..." }];
    this.isReconnecting = true;
    await this.refreshClusterState();
    this.isReconnecting = false;
  }

  render() {
    const { authOutput, cluster, hasErrors } = this;
    const isDisconnected = !!cluster.disconnected;
    const failureReason = cluster.failureReason;
    const isError = hasErrors || isDisconnected;
    return (
      <div className="ClusterStatus flex column gaps">
        {isError && (
          <Icon
            material="cloud_off"
            className={cssNames({ error: hasErrors })}
          />
        )}
        <h2>
          {cluster.contextName}
        </h2>
        {!isDisconnected && (
          <pre className="kube-auth-out">
            {authOutput.map(({ data, error }, index) => {
              return <p key={index} className={cssNames({ error })}>{data}</p>
            })}
          </pre>
        )}
        {failureReason && (
          <div className="failure-reason error">{failureReason}</div>
        )}
        {isError && (
          <Button
            primary
            label="Reconnect"
            className="box center"
            onClick={this.reconnect}
            waiting={this.isReconnecting}
          />
        )}
      </div>
    )
  }
}
