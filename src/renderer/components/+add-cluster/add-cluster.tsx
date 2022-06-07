/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./add-cluster.module.scss";

import type { KubeConfig } from "@kubernetes/client-node";
import fse from "fs-extra";
import { debounce } from "lodash";
import { action, computed, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import path from "path";
import React from "react";
import * as uuid from "uuid";
import { appEventBus } from "../../../common/app-event-bus/event-bus";
import { loadConfigFromString, splitConfig } from "../../../common/kube-helpers";
import { docsUrl } from "../../../common/vars";
import { isDefined, iter } from "../../utils";
import { Button } from "../button";
import { Notifications } from "../notifications";
import { SettingLayout } from "../layout/setting-layout";
import { MonacoEditor } from "../monaco-editor";
import { withInjectables } from "@ogre-tools/injectable-react";
import getCustomKubeConfigDirectoryInjectable from "../../../common/app-paths/get-custom-kube-config-directory/get-custom-kube-config-directory.injectable";
import type { NavigateToCatalog } from "../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import navigateToCatalogInjectable from "../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";

interface Option {
  config: KubeConfig;
  error?: string;
}

interface Dependencies {
  getCustomKubeConfigDirectory: (directoryName: string) => string;
  navigateToCatalog: NavigateToCatalog;
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
class NonInjectedAddCluster extends React.Component<Dependencies> {
  @observable kubeContexts = observable.map<string, Option>();
  @observable customConfig = "";
  @observable isWaiting = false;
  @observable errors: string[] = [];

  constructor(dependencies: Dependencies) {
    super(dependencies);
    makeObservable(this);
  }

  componentDidMount() {
    appEventBus.emit({ name: "cluster-add", action: "start" });
  }

  @computed get allErrors(): string[] {
    return [
      ...this.errors,
      ...iter.map(this.kubeContexts.values(), ({ error }) => error),
    ].filter(isDefined);
  }

  readonly refreshContexts = debounce(action(() => {
    const { config, error } = loadConfigFromString(this.customConfig.trim() || "{}");

    this.kubeContexts.replace(getContexts(config));

    if (error) {
      this.errors.push(error.toString());
    }

    if (config.contexts.length === 0) {
      this.errors.push('No contexts defined, either missing the "contexts" field, or it is empty.');
    }
  }), 500);

  addClusters = action(async () => {
    this.isWaiting = true;
    appEventBus.emit({ name: "cluster-add", action: "click" });

    try {
      const absPath = this.props.getCustomKubeConfigDirectory(uuid.v4());

      await fse.ensureDir(path.dirname(absPath));
      await fse.writeFile(absPath, this.customConfig.trim(), { encoding: "utf-8", mode: 0o600 });

      Notifications.ok(`Successfully added ${this.kubeContexts.size} new cluster(s)`);

      return this.props.navigateToCatalog();
    } catch (error) {
      Notifications.error(`Failed to add clusters: ${error}`);
    }
  });

  render() {
    return (
      <SettingLayout className={styles.AddClusters} data-testid="add-cluster-page">
        <h2>Add Clusters from Kubeconfig</h2>
        <p>
          {"Clusters added here are  "}
          <b>not</b>
          {" merged into the "}
          <code>~/.kube/config</code>
          {" file. "}
          <a
            href={`${docsUrl}/catalog/add-clusters/`}
            rel="noreferrer"
            target="_blank"
          >
            Read more about adding clusters.
          </a>
        </p>
        <div className="flex column">
          <MonacoEditor
            autoFocus
            className={styles.editor}
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

export const AddCluster = withInjectables<Dependencies>(NonInjectedAddCluster, {
  getProps: (di) => ({
    getCustomKubeConfigDirectory: di.inject(
      getCustomKubeConfigDirectoryInjectable,
    ),

    navigateToCatalog: di.inject(navigateToCatalogInjectable),
  }),
});
