/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import styles from "./delete-cluster-dialog.module.scss";

import { computed, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";

import { Button } from "../button";
import { saveKubeconfig } from "./save-config";
import { Notifications } from "../notifications";
import { autoBind } from "../../../common/utils";
import { Dialog } from "../dialog";
import { Icon } from "../icon";
import { Select } from "../select";
import { Checkbox } from "../checkbox";
import { requestClearClusterAsDeleting, requestDeleteCluster, requestSetClusterAsDeleting } from "../../ipc";
import { withInjectables } from "@ogre-tools/injectable-react";
import hotbarStoreInjectable from "../../../common/hotbar-store.injectable";
import type { DeleteClusterDialogModel } from "./delete-cluster-dialog-model/delete-cluster-dialog-model";
import deleteClusterDialogModelInjectable from "./delete-cluster-dialog-model/delete-cluster-dialog-model.injectable";
import type { HotbarStore } from "../../../common/hotbar-store";

interface Dependencies {
  hotbarStore: HotbarStore;
  model: DeleteClusterDialogModel;
}

@observer
class NonInjectedDeleteClusterDialog extends React.Component<Dependencies> {
  @observable showContextSwitch = false;
  @observable newCurrentContext = "";

  constructor(props: Dependencies) {
    super(props);
    makeObservable(this);
    autoBind(this);
  }

  onOpen() {
    this.newCurrentContext = "";

    if (this.isCurrentContext()) {
      this.showContextSwitch = true;
    }
  }

  onClose() {
    this.props.model.close();
    this.showContextSwitch = false;
  }

  removeContext() {
    this.props.model.config.contexts = this.props.model.config.contexts.filter(item =>
      item.name !== this.props.model.cluster.contextName,
    );
  }

  changeCurrentContext() {
    if (this.newCurrentContext && this.showContextSwitch) {
      this.props.model.config.currentContext = this.newCurrentContext;
    }
  }

  async onDelete() {
    const { cluster, config } = this.props.model;

    await requestSetClusterAsDeleting(cluster.id);
    this.removeContext();
    this.changeCurrentContext();

    try {
      await saveKubeconfig(config, cluster.kubeConfigPath);
      this.props.hotbarStore.removeAllHotbarItems(cluster.id);
      await requestDeleteCluster(cluster.id);
    } catch(error) {
      Notifications.error(`Cannot remove cluster, failed to process config file. ${error}`);
    } finally {
      await requestClearClusterAsDeleting(cluster.id);
    }

    this.onClose();
  }

  @computed get disableDelete() {
    const { cluster, config } = this.props.model;
    const noContextsAvailable = config.contexts.filter(context => context.name !== cluster.contextName).length == 0;
    const newContextNotSelected = this.newCurrentContext === "";

    if (noContextsAvailable) {
      return false;
    }

    return this.showContextSwitch && newContextNotSelected;
  }

  isCurrentContext() {
    return this.props.model.config.currentContext == this.props.model.cluster.contextName;
  }

  renderCurrentContextSwitch() {
    if (!this.showContextSwitch) return null;
    const { cluster, config } = this.props.model;
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
          id="delete-cluster-input"
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
    const { cluster } = this.props.model;

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
    const { cluster, config } = this.props.model;
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
    const { cluster, config, isOpen } = this.props.model;

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

export const DeleteClusterDialog = withInjectables<Dependencies>(
  NonInjectedDeleteClusterDialog,

  {
    getProps: (di) => ({
      hotbarStore: di.inject(hotbarStoreInjectable),
      model: di.inject(deleteClusterDialogModelInjectable),
    }),
  },
);
