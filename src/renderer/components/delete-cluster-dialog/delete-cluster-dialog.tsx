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

import { makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";

import { Button } from "../button";
import type { Context, KubeConfig } from "@kubernetes/client-node";
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

type DialogState = {
  isOpen: boolean,
  config?: KubeConfig,
  cluster?: Cluster
};

const dialogState: DialogState = observable({
  isOpen: false
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
      newCurrentContext: observable
    });
  }

  static open({ config, cluster }: Partial<DialogState>) {
    dialogState.isOpen = true;
    dialogState.config = config;
    dialogState.cluster = cluster;
  }

  static close() {
    dialogState.isOpen = false;
  }

  @boundMethod
  onOpen() {
    this.showContextSwitch = false;
    this.newCurrentContext = "";
  }

  onClose() {
    DeleteClusterDialog.close();
  }

  removeContext() {
    dialogState.config.contexts = dialogState.config.contexts.filter(item =>
      item.name !== dialogState.cluster.contextName
    );
  }

  changeCurrentContext() {
    if (this.newCurrentContext) {
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
      await requestMain(clusterClearDeletingHandler, cluster.id);
    }

    this.onClose();
  }

  renderCurrentContextSwitch(contexts: Context[]) {
    if (!this.showContextSwitch) return null;

    const options = [
      ...contexts.map(context => ({
        label: context.name,
        value: context.name,
      })),
    ];

    return (
      <div className="mt-4">
        <p className="mb-4 font-semibold">Choose new current-context</p>
        <Select
          options={options}
          onChange={({ value }) => this.newCurrentContext = value}
          themeName="light"
          className="ml-[1px] mr-[1px]"
        />
      </div>
    )
  }

  render() {
    const { cluster, config, isOpen } = dialogState;

    if (!cluster || !config) return null;

    const isCurrentContext = config.currentContext == cluster.contextName;
    const contexts = config.contexts.filter(context => context.name !== cluster.contextName);

    const warning = isCurrentContext ? (
      <>
        <p data-testid="context-warning">The <b>current-context</b> field from the kubeconfig file indicates a minikube context
        that will cease to exist after the change. This will affect the operation of kubectl.{" "}
        {contexts.length > 0 && (
          <b
            className="cursor-pointer underline"
            onClick={() => this.showContextSwitch = !this.showContextSwitch}
          >Replace current context</b>
        )}
        </p>
      </>
    ) : (
      <p>The contents of your kubeconfig file will be changed!</p>
    );

    return (
      <Dialog
        className={styles.dialog}
        isOpen={isOpen}
        close={this.onClose}
        open={this.onOpen}
      >
        <div className={styles.dialogContent}>
          <div>
            Delete the <b>{cluster.getMeta().name}</b> context from <b>{cluster.kubeConfigPath}</b>?
          </div>
          <div className={styles.warning}>
            <Icon material="warning_amber" className={styles.warningIcon}/>
            {warning}
          </div>
          {this.renderCurrentContextSwitch(contexts)}
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
          />
        </div>
      </Dialog>
    );
  }
}
