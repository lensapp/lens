/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import styles from "./view.module.scss";

import type { IObservableValue } from "mobx";
import { action, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";

import { Button } from "../button";
import { saveKubeconfig } from "./save-config";
import { Notifications } from "../notifications";
import { Dialog } from "../dialog";
import { Icon } from "../icon";
import { Select } from "../select";
import { Checkbox } from "../checkbox";
import { requestClearClusterAsDeleting, requestDeleteCluster, requestSetClusterAsDeleting } from "../../ipc";
import type { HotbarStore } from "../../../common/hotbars/store";
import { withInjectables } from "@ogre-tools/injectable-react";
import hotbarStoreInjectable from "../../../common/hotbars/store.injectable";
import type { DeleteClusterDialogState } from "./state.injectable";
import deleteClusterDialogStateInjectable from "./state.injectable";

export interface Dependencies {
  state: IObservableValue<DeleteClusterDialogState | undefined>;
  hotbarStore: HotbarStore;
}

@observer
class NonInjectedDeleteClusterDialog extends React.Component<Dependencies> {
  private readonly showContextSwitch = observable.box(false);
  private readonly newCurrentContext = observable.box("");

  @action
  onOpen(state: DeleteClusterDialogState) {
    this.newCurrentContext.set("");
    this.showContextSwitch.set(this.isCurrentContext(state));
  }

  onClose = () => {
    this.showContextSwitch.set(false);
  };

  removeContext(state: DeleteClusterDialogState) {
    state.config.contexts = state.config.contexts.filter(item =>
      item.name !== state.cluster.contextName,
    );
  }

  changeCurrentContext(state: DeleteClusterDialogState) {
    const newCurrentContext = this.newCurrentContext.get();
    const showContextSwitch = this.showContextSwitch.get();

    if (newCurrentContext && showContextSwitch) {
      state.config.currentContext = newCurrentContext;
    }
  }

  async onDelete(state: DeleteClusterDialogState) {
    const { cluster, config } = state;

    await requestSetClusterAsDeleting(cluster.id);
    this.removeContext(state);
    this.changeCurrentContext(state);

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

  shouldDeleteBeDisabled({ cluster, config }: DeleteClusterDialogState): boolean {
    const noContextsAvailable = config.contexts.filter(context => context.name !== cluster.contextName).length == 0;
    const newContextNotSelected = this.newCurrentContext.get() === "";
    const showContextSwitch = this.showContextSwitch.get();

    if (noContextsAvailable) {
      return false;
    }

    return showContextSwitch && newContextNotSelected;
  }

  isCurrentContext({ cluster, config }: DeleteClusterDialogState) {
    return config.currentContext == cluster.contextName;
  }

  renderCurrentContextSwitch({ cluster, config }: DeleteClusterDialogState) {
    if (!this.showContextSwitch.get()) {
      return null;
    }

    return (
      <div className="mt-4">
        <Select
          id="delete-cluster-input"
          options={(
            config
              .contexts
              .filter(context => context.name !== cluster.contextName)
              .map(ctx => ctx.name)
          )}
          value={this.newCurrentContext.get()}
          onChange={contextName => {
            if (contextName) {
              this.newCurrentContext.set(contextName);
            }
          }}
          themeName="light"
          className="ml-[1px] mr-[1px]"
        />
      </div>
    );
  }

  renderDeleteMessage({ cluster }: DeleteClusterDialogState) {
    if (cluster.isInLocalKubeconfig()) {
      return (
        <div>
          {"Delete the "}
          <b>
            {cluster.getMeta().name}
          </b>
          {" context from Lens's internal kubeconfig?"}
        </div>
      );
    }

    return (
      <div>
        {"Delete the "}
        <b>
          {cluster.getMeta().name}
        </b>
        {" context from "}
        <b>
          {cluster.kubeConfigPath}
        </b>
        ?
      </div>
    );
  }

  getWarningMessage({ cluster, config }: DeleteClusterDialogState) {
    const contexts = config.contexts.filter(context => context.name !== cluster.contextName);

    if (!contexts.length) {
      return (
        <p data-testid="no-more-contexts-warning">
          This will remove the last context in kubeconfig. There will be no active context.
        </p>
      );
    }

    if (this.isCurrentContext({ cluster, config })) {
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

  renderWarning(state: DeleteClusterDialogState) {
    return (
      <div className={styles.warning}>
        <Icon material="warning_amber" className={styles.warningIcon} />
        {this.getWarningMessage(state)}
      </div>
    );
  }

  renderContents(state: DeleteClusterDialogState) {
    const contexts = state.config.contexts.filter(context => context.name !== state.cluster.contextName);
    const disableDelete = this.shouldDeleteBeDisabled(state);

    return (
      <>
        <div className={styles.dialogContent}>
          {this.renderDeleteMessage(state)}
          {this.renderWarning(state)}
          <hr className={styles.hr} />
          {contexts.length > 0 && (
            <>
              <div className="mt-4">
                <Checkbox
                  data-testid="context-switch"
                  label={(
                    <>
                      <span className="font-semibold">Select current-context</span>
                      {" "}
                      {!this.isCurrentContext(state) && "(optional)"}
                    </>
                  )}
                  value={this.showContextSwitch.get()}
                  onChange={value => this.showContextSwitch.set(this.isCurrentContext(state) || value)}
                />
              </div>
              {this.renderCurrentContextSwitch(state)}
            </>
          )}
        </div>
        <div className={styles.dialogButtons}>
          <Button
            onClick={this.close}
            plain
            label="Cancel"
          />
          <Button
            onClick={() => this.onDelete(state)}
            autoFocus
            accent
            label="Delete Context"
            disabled={disableDelete}
          />
        </div>
      </>
    );
  }

  private close = () => this.props.state.set(undefined);

  render() {
    const state = this.props.state.get();

    return (
      <Dialog
        className={styles.dialog}
        isOpen={Boolean(state)}
        close={this.close}
        onClose={this.onClose}
        onOpen={state && (() => this.onOpen(state))}
      >
        {state && this.renderContents(state)}
      </Dialog>
    );
  }
}

export const DeleteClusterDialog = withInjectables<Dependencies>(NonInjectedDeleteClusterDialog, {
  getProps: (di) => ({
    hotbarStore: di.inject(hotbarStoreInjectable),
    state: di.inject(deleteClusterDialogStateInjectable),
  }),
});
