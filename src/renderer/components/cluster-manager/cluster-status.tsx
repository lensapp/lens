import type { KubeAuthProxyResponse } from "../../../main/kube-auth-proxy";

import "./cluster-status.scss"
import React from "react";
import { observer } from "mobx-react";
import { ipcRenderer } from "electron";
import { computed, observable } from "mobx";
import { clusterIpc } from "../../../common/cluster-ipc";
import { getHostedCluster } from "../../../common/cluster-store";
import { Icon } from "../icon";
import { Button } from "../button";
import { cssNames } from "../../utils";

@observer
export class ClusterStatus extends React.Component {
  @observable authOutput: KubeAuthProxyResponse[] = [];
  @observable isReconnecting = false;

  @computed get hasErrors() {
    return this.authOutput.some(({ error }) => error)
  }

  @computed get cluster() {
    return getHostedCluster();
  }

  async componentDidMount() {
    this.authOutput = [{ data: "Connecting..." }];
    ipcRenderer.on(`kube-auth:${this.cluster.id}`, (evt, res: KubeAuthProxyResponse) => {
      this.authOutput.push({
        data: res.data.trimRight(),
        error: res.error,
      });
    })
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(`kube-auth:${this.cluster.id}`);
  }

  reconnect = async () => {
    this.authOutput = [{ data: "Reconnecting..." }];
    this.isReconnecting = true;
    await clusterIpc.activate.invokeFromRenderer();
    this.isReconnecting = false;
  }

  render() {
    const { authOutput, cluster, hasErrors } = this;
    const isDisconnected = !!cluster.disconnected;
    const isInactive = hasErrors || isDisconnected;
    return (
      <div className="ClusterStatus flex column gaps">
        {isInactive && (
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
        {isInactive && (
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
