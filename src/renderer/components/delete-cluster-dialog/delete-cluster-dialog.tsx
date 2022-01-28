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
import { requestMain } from "../../../common/ipc";
import { clusterClearDeletingHandler, clusterDeleteHandler, clusterSetDeletingHandler } from "../../../common/cluster-ipc";
import { Notifications } from "../notifications";
import { boundMethod } from "autobind-decorator";
import { Dialog } from "../dialog";
import { Icon } from "../icon";
import { Select } from "../select";
import { Checkbox } from "../checkbox";
import { withInjectables } from "@ogre-tools/injectable-react";
import removeAllHotbarItemsInjectable from "../../../common/hotbar-store/remove-all-hotbar-items.injectable";
import type { DeleteClusterDialogState } from "./state.injectable";
import deleteClusterDialogStateInjectable from "./state.injectable";
import closeDeleteClusterDialogInjectable from "./close-delete-cluster-dialog.injectable";

interface Dependencies {
  removeAllHotbarItems: (id: string) => void;
  readonly state: DeleteClusterDialogState;
  closeDeleteClusterDialog: () => void;
}

@observer
class NonInjectedDeleteClusterDialog extends React.Component<Dependencies> {
  @observable showContextSwitch = false;
  @observable newCurrentContext = "";

  constructor(props: Dependencies) {
    super(props);
    makeObservable(this);
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
    this.props.closeDeleteClusterDialog();
    this.showContextSwitch = false;
  }

  removeContext() {
    this.props.state.config.contexts = this.props.state.config.contexts.filter(item =>
      item.name !== this.props.state.cluster.contextName,
    );
  }

  changeCurrentContext() {
    if (this.newCurrentContext && this.showContextSwitch) {
      this.props.state.config.currentContext = this.newCurrentContext;
    }
  }

  @boundMethod
  async onDelete() {
    const { cluster, config } = this.props.state;

    await requestMain(clusterSetDeletingHandler, cluster.id);
    this.removeContext();
    this.changeCurrentContext();

    try {
      await saveKubeconfig(config, cluster.kubeConfigPath);
      this.props.removeAllHotbarItems(cluster.id);
      await requestMain(clusterDeleteHandler, cluster.id);
    } catch(error) {
      Notifications.error(`Cannot remove cluster, failed to process config file. ${error}`);
    } finally {
      await requestMain(clusterClearDeletingHandler, cluster.id);
    }

    this.onClose();
  }

  @computed get disableDelete() {
    const { cluster, config } = this.props.state;
    const noContextsAvailable = config.contexts.filter(context => context.name !== cluster.contextName).length == 0;
    const newContextNotSelected = this.newCurrentContext === "";

    if (noContextsAvailable) {
      return false;
    }

    return this.showContextSwitch && newContextNotSelected;
  }

  isCurrentContext() {
    return this.props.state.config.currentContext == this.props.state.cluster.contextName;
  }

  renderCurrentContextSwitch() {
    if (!this.showContextSwitch) return null;
    const { cluster, config } = this.props.state;
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
    const { cluster } = this.props.state;

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
    const { cluster, config } = this.props.state;
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
    const { cluster, config } = this.props.state;
    const isOpen = Boolean(cluster && config);

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

export const DeleteClusterDialog = withInjectables<Dependencies>(NonInjectedDeleteClusterDialog, {
  getProps: (di, props) => ({
    removeAllHotbarItems: di.inject(removeAllHotbarItemsInjectable),
    state: di.inject(deleteClusterDialogStateInjectable),
    closeDeleteClusterDialog: di.inject(closeDeleteClusterDialogInjectable),
    ...props,
  }),
});
