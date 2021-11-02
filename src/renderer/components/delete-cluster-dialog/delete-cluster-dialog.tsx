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
import styles from "./delete-cluster-dialog.module.css";

import { computed, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";

import { Button } from "../button";
import type { KubeConfig } from "@kubernetes/client-node";
import type { Cluster } from "../../../main/cluster";
import { saveKubeconfig } from "./save-config";
import { requestMain } from "../../../common/ipc";
import { clusterClearDeletingHandler, clusterDeleteHandler, clusterSetDeletingHandler } from "../../../common/cluster-ipc";
import { Notifications } from "../notifications";
import { HotbarStore } from "../../../common/hotbar-store";
import { boundMethod } from "autobind-decorator";
import { Dialog } from "../dialog";
import { Icon } from "../icon";
import { Select } from "../select";
import { Checkbox } from "../checkbox";

type DialogState = {
  isOpen: boolean,
  config?: KubeConfig,
  cluster?: Cluster
};

const dialogState: DialogState = observable({
  isOpen: false,
});

type Props = {};

@observer
export class DeleteClusterDialog extends React.Component {
  showContextSwitch = false;
  newCurrentContext = "";

  constructor(props: Props) {
    super(props);
    makeObservable(this, {
      showContextSwitch: observable,
      newCurrentContext: observable,
    });
  }

  static open({ config, cluster }: Partial<DialogState>) {
    dialogState.isOpen = true;
    dialogState.config = config;
    dialogState.cluster = cluster;
  }

  static close() {
    dialogState.isOpen = false;
    dialogState.cluster = null;
    dialogState.config = null;
  }

  @boundMethod
  onOpen() {
    this.newCurrentContext = "";

    if (this.isCurrentContext()) {
      this.showContextSwitch = true;
    }
  }

  @boundMethod
  onClose() {
    DeleteClusterDialog.close();
    this.showContextSwitch = false;
  }

  removeContext() {
    dialogState.config.contexts = dialogState.config.contexts.filter(item =>
      item.name !== dialogState.cluster.contextName,
    );
  }

  changeCurrentContext() {
    if (this.newCurrentContext && this.showContextSwitch) {
      dialogState.config.currentContext = this.newCurrentContext;
    }
  }

  @boundMethod
  async onDelete() {
    const { cluster, config } = dialogState;

    await requestMain(clusterSetDeletingHandler, cluster.id);
    this.removeContext();
    this.changeCurrentContext();

    try {
      await saveKubeconfig(config, cluster.kubeConfigPath);
      HotbarStore.getInstance().removeAllHotbarItems(cluster.id);
      await requestMain(clusterDeleteHandler, cluster.id);
    } catch(error) {
      Notifications.error(`Cannot remove cluster, failed to process config file. ${error}`);
    } finally {
      await requestMain(clusterClearDeletingHandler, cluster.id);
    }

    this.onClose();
  }

  @computed get disableDelete() {
    const { cluster, config } = dialogState;
    const noContextsAvailable = config.contexts.filter(context => context.name !== cluster.contextName).length == 0;
    const newContextNotSelected = this.newCurrentContext === "";

    if (noContextsAvailable) {
      return false;
    }

    return this.showContextSwitch && newContextNotSelected;
  }

  isCurrentContext() {
    return dialogState.config.currentContext == dialogState.cluster.contextName;
  }

  renderCurrentContextSwitch() {
    if (!this.showContextSwitch) return null;
    const { cluster, config } = dialogState;
    const contexts = config.contexts.filter(context => context.name !== cluster.contextName);

    const options = [
      ...contexts.map(context => ({
        label: context.name,
        value: context.name,
      })),
    ];

    return (
      <div className="mt-4">
        <Select
          options={options}
          value={this.newCurrentContext}
          onChange={({ value }) => this.newCurrentContext = value}
          themeName="light"
          className="ml-[1px] mr-[1px]"
        />
      </div>
    );
  }

  renderDeleteMessage() {
    const { cluster } = dialogState;

    if (cluster.isInLocalKubeconfig()) {
      return (
        <div>
          Delete the <b>{cluster.getMeta().name}</b> context from Lens&apos;s internal kubeconfig?
        </div>
      );
    }

    return (
      <div>
        Delete the <b>{cluster.getMeta().name}</b> context from <b>{cluster.kubeConfigPath}</b>?
      </div>
    );
  }

  getWarningMessage() {
    const { cluster, config } = dialogState;
    const contexts = config.contexts.filter(context => context.name !== cluster.contextName);

    if (!contexts.length) {
      return (
        <p data-testid="no-more-contexts-warning">
          This will remove the last context in kubeconfig. There will be no active context.
        </p>
      );
    }

    if (this.isCurrentContext()) {
      return (
        <p data-testid="current-context-warning">
          This will remove active context in kubeconfig. Use drop down below to&nbsp;select a&nbsp;different one.
        </p>
      );
    }

    if (cluster.isInLocalKubeconfig()) {
      return (
        <p data-testid="internal-kubeconfig-warning">
          Are you sure you want to delete it? It can be re-added through the copy/paste mechanism.
        </p>
      );
    }

    return (
      <p data-testid="kubeconfig-change-warning">The contents of kubeconfig file will be changed!</p>
    );
  }

  renderWarning() {
    return (
      <div className={styles.warning}>
        <Icon material="warning_amber" className={styles.warningIcon}/>
        {this.getWarningMessage()}
      </div>
    );
  }

  render() {
    const { cluster, config, isOpen } = dialogState;

    if (!cluster || !config) return null;

    const contexts = config.contexts.filter(context => context.name !== cluster.contextName);

    return (
      <Dialog
        className={styles.dialog}
        isOpen={isOpen}
        close={this.onClose}
        onOpen={this.onOpen}
      >
        <div className={styles.dialogContent}>
          {this.renderDeleteMessage()}
          {this.renderWarning()}
          <hr className={styles.hr}/>
          {contexts.length > 0 && (
            <>
              <div className="mt-4">
                <Checkbox
                  data-testid="context-switch"
                  theme="light"
                  label={(
                    <>
                      <span className="font-semibold">Select current-context</span>{" "}
                      {!this.isCurrentContext() && "(optional)"}
                    </>
                  )}
                  value={this.showContextSwitch}
                  onChange={value => this.showContextSwitch = this.isCurrentContext() ? true : value}
                />
              </div>
              {this.renderCurrentContextSwitch()}
            </>
          )}
        </div>
        <div className={styles.dialogButtons}>
          <Button
            onClick={this.onClose} plain
            label="Cancel"
          />
          <Button
            onClick={this.onDelete}
            autoFocus accent
            label="Delete Context"
            disabled={this.disableDelete}
          />
        </div>
      </Dialog>
    );
  }
}
