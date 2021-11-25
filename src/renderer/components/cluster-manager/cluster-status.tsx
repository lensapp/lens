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

import styles from "./cluster-status.module.css";

import { computed, observable, makeObservable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";
import { clusterActivateHandler } from "../../../common/cluster-ipc";
import { ipcRendererOn, requestMain } from "../../../common/ipc";
import type { Cluster } from "../../../main/cluster";
import { cssNames, IClassName } from "../../utils";
import { Button } from "../button";
import { Icon } from "../icon";
import { Spinner } from "../spinner";
import { navigate } from "../../navigation";
import { entitySettingsURL } from "../../../common/routes";
import type { KubeAuthUpdate } from "../../../common/cluster-types";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";

interface Props {
  className?: IClassName;
  cluster: Cluster;
}

@observer
export class ClusterStatus extends React.Component<Props> {
  @observable authOutput: KubeAuthUpdate[] = [];
  @observable isReconnecting = false;

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  get cluster(): Cluster {
    return this.props.cluster;
  }

  @computed get entity() {
    return catalogEntityRegistry.getById(this.cluster.id);
  }

  @computed get hasErrors(): boolean {
    return this.authOutput.some(({ isError }) => isError);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      ipcRendererOn(`cluster:${this.cluster.id}:connection-update`, (evt, res: KubeAuthUpdate) => {
        this.authOutput.push(res);
      }),
    ]);
  }

  reconnect = async () => {
    this.authOutput = [];
    this.isReconnecting = true;

    try {
      await requestMain(clusterActivateHandler, this.cluster.id, true);
    } catch (error) {
      this.authOutput.push({
        message: error.toString(),
        isError: true,
      });
    } finally {
      this.isReconnecting = false;
    }
  };

  manageProxySettings = () => {
    navigate(entitySettingsURL({
      params: {
        entityId: this.cluster.id,
      },
      fragment: "proxy",
    }));
  };

  renderAuthenticationOutput() {
    return (
      <pre>
        {
          this.authOutput.map(({ message, isError }, index) => (
            <p key={index} className={cssNames({ error: isError })}>
              {message.trim()}
            </p>
          ))
        }
      </pre>
    );
  }

  renderStatusIcon() {
    if (this.hasErrors) {
      return <Icon material="cloud_off" className={styles.icon} />;
    }

    return (
      <>
        <Spinner singleColor={false} className={styles.spinner} />
        <pre className="kube-auth-out">
          <p>{this.isReconnecting ? "Reconnecting" : "Connecting"}&hellip;</p>
        </pre>
      </>
    );
  }

  renderReconnectionHelp() {
    if (this.hasErrors && !this.isReconnecting) {
      return (
        <>
          <Button
            primary
            label="Reconnect"
            className="box center"
            onClick={this.reconnect}
            waiting={this.isReconnecting}
          />
          <a
            className="box center interactive"
            onClick={this.manageProxySettings}
          >
            Manage Proxy Settings
          </a>
        </>
      );
    }

    return undefined;
  }

  render() {
    return (
      <div className={cssNames(styles.status, "flex column box center align-center justify-center", this.props.className)}>
        <div className="flex items-center column gaps">
          <h2>{this.entity.getName()}</h2>
          {this.renderStatusIcon()}
          {this.renderAuthenticationOutput()}
          {this.renderReconnectionHelp()}
        </div>
      </div>
    );
  }
}
