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

import type { KubeConfig } from "@kubernetes/client-node";
import fse from "fs-extra";
import { debounce } from "lodash";
import { action, computed, observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import path from "path";
import React from "react";

import { catalogURL } from "../../../common/routes";
import { appEventBus } from "../../../common/event-bus";
import { loadConfigFromString, splitConfig } from "../../../common/kube-helpers";
import { docsUrl } from "../../../common/vars";
import { navigate } from "../../navigation";
import { getCustomKubeConfigPath, cssNames, iter } from "../../utils";
import { Button } from "../button";
import { Notifications } from "../notifications";
import { SettingLayout } from "../layout/setting-layout";
import MonacoEditor from "react-monaco-editor";
import { ThemeStore } from "../../theme.store";
import { UserStore } from "../../../common/user-store";

interface Option {
  config: KubeConfig;
  error?: string;
}

function getContexts(config: KubeConfig): Map<string, Option> {
  return new Map(
    splitConfig(config)
      .map(({ config, error }) => [config.currentContext, {
        config,
        error,
      }]),
  );
}

@observer
export class AddCluster extends React.Component {
  @observable kubeContexts = observable.map<string, Option>();
  @observable customConfig = "";
  @observable isWaiting = false;
  @observable errors: string[] = [];

  constructor(props: {}) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    appEventBus.emit({ name: "cluster-add", action: "start" });
  }

  @computed get allErrors(): string[] {
    return [
      ...this.errors,
      ...iter.map(this.kubeContexts.values(), ({ error }) => error),
    ].filter(Boolean);
  }

  @action
  refreshContexts = debounce(() => {
    const { config, error } = loadConfigFromString(this.customConfig.trim() || "{}");

    this.kubeContexts.replace(getContexts(config));
    
    if (error) {
      this.errors.push(error.toString());
    }

    if (config.contexts.length === 0) {
      this.errors.push('No contexts defined, either missing the "contexts" field, or it is empty.');
    }
  }, 500);

  @action
  addClusters = async () => {
    this.isWaiting = true;
    appEventBus.emit({ name: "cluster-add", action: "click" });

    try {
      const absPath = getCustomKubeConfigPath();

      await fse.ensureDir(path.dirname(absPath));
      await fse.writeFile(absPath, this.customConfig.trim(), { encoding: "utf-8", mode: 0o600 });

      Notifications.ok(`Successfully added ${this.kubeContexts.size} new cluster(s)`);

      return navigate(catalogURL());
    } catch (error) {
      Notifications.error(`Failed to add clusters: ${error}`);
    }
  };

  render() {
    return (
      <SettingLayout className="AddClusters">
        <h2>Add Clusters from Kubeconfig</h2>
        <p>
          Clusters added here are <b>not</b> merged into the <code>~/.kube/config</code> file.{" "}
          <a href={`${docsUrl}/catalog/add-clusters/`} rel="noreferrer" target="_blank">Read more about adding clusters</a>.
        </p>
        <div className="flex column">
          <MonacoEditor
            options={{ ...UserStore.getInstance().getEditorOptions() }}
            className={cssNames("MonacoEditor")}
            theme={ThemeStore.getInstance().activeTheme.monacoTheme}
            language="yaml"
            value={this.customConfig}
            onChange={value => {
              this.customConfig = value;
              this.errors.length = 0;
              this.refreshContexts();
            }}
          />
        </div>
        {this.allErrors.length > 0 && (
          <>
            <h3>KubeConfig Yaml Validation Errors:</h3>
            {...this.allErrors.map(error => <div key={error} className="error">{error}</div>)}
          </>
        )}
        <div className="actions-panel">
          <Button
            primary
            disabled={this.kubeContexts.size === 0}
            label={this.kubeContexts.size === 1 ? "Add cluster" : "Add clusters"}
            onClick={this.addClusters}
            waiting={this.isWaiting}
            tooltip={this.kubeContexts.size === 0 || "Paste in at least one cluster to add."}
            tooltipOverrideDisabled
          />
        </div>
      </SettingLayout>
    );
  }
}
