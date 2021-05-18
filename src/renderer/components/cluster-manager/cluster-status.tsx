/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import type { KubeAuthProxyLog } from "../../../main/kube-auth-proxy";

import "./cluster-status.scss";
import React from "react";
import { observer } from "mobx-react";
import { ipcRenderer } from "electron";
import { computed, observable } from "mobx";
import { requestMain, subscribeToBroadcast } from "../../../common/ipc";
import { Icon } from "../icon";
import { Button } from "../button";
import { cssNames, IClassName } from "../../utils";
import { Cluster } from "../../../main/cluster";
import { ClusterId, ClusterStore } from "../../../common/cluster-store";
import { CubeSpinner } from "../spinner";
import { clusterActivateHandler } from "../../../common/cluster-ipc";

interface Props {
  className?: IClassName;
  clusterId: ClusterId;
}

@observer
export class ClusterStatus extends React.Component<Props> {
  @observable authOutput: KubeAuthProxyLog[] = [];
  @observable isReconnecting = false;

  get cluster(): Cluster {
    return ClusterStore.getInstance().getById(this.props.clusterId);
  }

  @computed get hasErrors(): boolean {
    return this.authOutput.some(({ error }) => error) || !!this.cluster.failureReason;
  }

  async componentDidMount() {
    subscribeToBroadcast(`kube-auth:${this.cluster.id}`, (evt, res: KubeAuthProxyLog) => {
      this.authOutput.push({
        data: res.data.trimRight(),
        error: res.error,
      });
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(`kube-auth:${this.props.clusterId}`);
  }

  activateCluster = async (force = false) => {
    await requestMain(clusterActivateHandler, this.props.clusterId, force);
  };

  reconnect = async () => {
    this.authOutput = [];
    this.isReconnecting = true;
    await this.activateCluster(true);
    this.isReconnecting = false;
  };

  renderContent() {
    const { authOutput, cluster, hasErrors } = this;
    const failureReason = cluster.failureReason;

    if (!hasErrors || this.isReconnecting) {
      return (
        <>
          <CubeSpinner/>
          <pre className="kube-auth-out">
            <p>{this.isReconnecting ? "Reconnecting..." : "Connecting..."}</p>
            {authOutput.map(({ data, error }, index) => {
              return <p key={index} className={cssNames({ error })}>{data}</p>;
            })}
          </pre>
        </>
      );
    }

    return (
      <>
        <Icon material="cloud_off" className="error"/>
        <h2>
          {cluster.preferences.clusterName}
        </h2>
        <pre className="kube-auth-out">
          {authOutput.map(({ data, error }, index) => {
            return <p key={index} className={cssNames({ error })}>{data}</p>;
          })}
        </pre>
        {failureReason && (
          <div className="failure-reason error">{failureReason}</div>
        )}
        <Button
          primary
          label="Reconnect"
          className="box center"
          onClick={this.reconnect}
          waiting={this.isReconnecting}
        />
      </>
    );
  }

  render() {
    return (
      <div className={cssNames("ClusterStatus flex column gaps box center align-center justify-center", this.props.className)}>
        {this.renderContent()}
      </div>
    );
  }
}
