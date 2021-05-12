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

import "./add-cluster.scss";
import React from "react";
import { observer } from "mobx-react";
import { action, observable, runInAction, makeObservable } from "mobx";
import { KubeConfig } from "@kubernetes/client-node";
import { AceEditor } from "../ace-editor";
import { Button } from "../button";
import { loadConfig, splitConfig, validateKubeConfig } from "../../../common/kube-helpers";
import { ClusterStore } from "../../../common/cluster-store";
import { v4 as uuid } from "uuid";
import { navigate } from "../../navigation";
import { UserStore } from "../../../common/user-store";
import { Notifications } from "../notifications";
import { ExecValidationNotFoundError } from "../../../common/custom-errors";
import { appEventBus } from "../../../common/event-bus";
import { PageLayout } from "../layout/page-layout";
import { docsUrl } from "../../../common/vars";
import { catalogURL } from "../+catalog";
import { preferencesURL } from "../+preferences";
import { Input } from "../input";
@observer
export class AddCluster extends React.Component {
  @observable.ref kubeConfigLocal: KubeConfig;
  @observable.ref error: React.ReactNode;
  @observable customConfig = "";
  @observable proxyServer = "";
  @observable isWaiting = false;
  @observable showSettings = false;

  kubeContexts = observable.map<string, KubeConfig>();

  constructor(props: {}) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    appEventBus.emit({ name: "cluster-add", action: "start" });
  }

  componentWillUnmount() {
    UserStore.getInstance().markNewContextsAsSeen();
  }

  @action
  refreshContexts() {
    this.kubeContexts.clear();

    try {
      this.error = "";
      const contexts = this.getContexts(loadConfig(this.customConfig || "{}"));

      console.log(contexts);

      this.kubeContexts.replace(contexts);
    } catch (err) {
      this.error = String(err);
    }
  }

  getContexts(config: KubeConfig): Map<string, KubeConfig> {
    const contexts = new Map();

    splitConfig(config).forEach(config => {
      contexts.set(config.currentContext, config);
    });

    return contexts;
  }

  @action
  addClusters = (): void => {
    try {

      this.error = "";
      this.isWaiting = true;
      appEventBus.emit({ name: "cluster-add", action: "click" });
      const newClusters = Array.from(this.kubeContexts.keys()).filter(context => {
        const kubeConfig = this.kubeContexts.get(context);
        const error = validateKubeConfig(kubeConfig, context);

        if (error) {
          this.error = error.toString();

          if (error instanceof ExecValidationNotFoundError) {
            Notifications.error(<>Error while adding cluster(s): {this.error}</>);
          }
        }

        return Boolean(!error);
      }).map(context => {
        const clusterId = uuid();
        const kubeConfig = this.kubeContexts.get(context);
        const kubeConfigPath = ClusterStore.embedCustomKubeConfig(clusterId, kubeConfig); // save in app-files folder

        return {
          id: clusterId,
          kubeConfigPath,
          contextName: kubeConfig.currentContext,
          preferences: {
            clusterName: kubeConfig.currentContext,
            httpsProxy: this.proxyServer || undefined,
          },
        };
      });

      runInAction(() => {
        ClusterStore.getInstance().addClusters(...newClusters);

        Notifications.ok(
          <>Successfully imported <b>{newClusters.length}</b> cluster(s)</>
        );

        navigate(catalogURL());
      });
      this.refreshContexts();
    } catch (err) {
      this.error = String(err);
      Notifications.error(<>Error while adding cluster(s): {this.error}</>);
    } finally {
      this.isWaiting = false;
    }
  };

  renderInfo() {
    return (
      <p>
        Paste kubeconfig as a text from the clipboard to the textarea below.
        If you want to add clusters from kubeconfigs that exists on filesystem, please add those files (or folders) to kubeconfig sync via <a onClick={() => navigate(preferencesURL())}>Preferences</a>.
        Read more about adding clusters <a href={`${docsUrl}/clusters/adding-clusters/`} rel="noreferrer" target="_blank">here</a>.
      </p>
    );
  }

  renderKubeConfigSource() {
    return (
      <>
        <div className="flex column">
          <AceEditor
            autoFocus
            showGutter={false}
            mode="yaml"
            value={this.customConfig}
            wrap={true}
            onChange={value => {
              this.customConfig = value;
              this.refreshContexts();
            }}
          />
        </div>
      </>
    );
  }

  render() {
    const submitDisabled = this.kubeContexts.size === 0;

    return (
      <PageLayout className="AddClusters" showOnTop={true}>
        <h2>Add Clusters from Kubeconfig</h2>
        {this.renderInfo()}
        {this.renderKubeConfigSource()}
        <div className="cluster-settings">
          <a href="#" onClick={() => this.showSettings = !this.showSettings}>
            Proxy settings
          </a>
        </div>
        {this.showSettings && (
          <div className="proxy-settings">
            <p>HTTP Proxy server. Used for communicating with Kubernetes API.</p>
            <Input
              autoFocus
              value={this.proxyServer}
              onChange={value => this.proxyServer = value}
              theme="round-black"
            />
            <small className="hint">
              {"A HTTP proxy server URL (format: http://<address>:<port>)."}
            </small>
          </div>
        )}
        {this.error && (
          <div className="error">{this.error}</div>
        )}

        <div className="actions-panel">
          <Button
            primary
            disabled={submitDisabled}
            label={this.kubeContexts.keys.length < 2 ? "Add cluster" : "Add clusters"}
            onClick={this.addClusters}
            waiting={this.isWaiting}
            tooltip={submitDisabled ? "Paste a valid kubeconfig." : undefined}
            tooltipOverrideDisabled
          />
        </div>
      </PageLayout>
    );
  }
}
