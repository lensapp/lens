import "./cluster-manager.scss"
import type { KubeAuthProxyResponse } from "../../../main/kube-auth-proxy";
import { Cluster, ClusterIpcEvent } from "../../../main/cluster";
import React from "react";
import { ipcRenderer } from "electron";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import { Icon } from "../icon";
import { Button } from "../button";
import { Trans } from "@lingui/macro";

interface Props {
  cluster: Cluster;
}

@observer
export class ClusterStatus extends React.Component<Props> {
  @observable authProxyOutput = "Connecting ...\n"

  @computed get clusterId() {
    return this.props.cluster.id;
  }

  componentDidMount() {
    ipcRenderer.on(`kube-auth:${this.clusterId}`, (evt, authResponse: KubeAuthProxyResponse) => {
      this.authProxyOutput += authResponse.data;
    })
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(`kube-auth:${this.clusterId}`);
  }

  reconnectCluster = () => {
    ipcRenderer.send(ClusterIpcEvent.RECONNECT, this.clusterId);
  }

  render() {
    const { authProxyOutput } = this;
    const { contextName, online } = this.props.cluster;
    return (
      <div className="ClusterStatus flex column">
        <Icon sticker className="status-icon" material={online ? "https" : "cloud_off"}/>
        <h2>{contextName}</h2>
        <pre className="kube-auth-stdout">{authProxyOutput}</pre>
        <Button
          primary label={<Trans>Reconnect</Trans>}
          onClick={this.reconnectCluster}
        />
      </div>
    )
  }
}
