/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import styles from "./view.module.scss";

import type { IObservableValue } from "mobx";
import { runInAction } from "mobx";
import { observer } from "mobx-react";
import React from "react";

import { Button } from "@k8slens/button";
import type { ShowNotification } from "@k8slens/notifications";
import { Dialog } from "../dialog";
import { Icon } from "@k8slens/icon";
import { Select } from "../select";
import { Checkbox } from "../checkbox";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { DeleteClusterDialogState } from "./state.injectable";
import deleteClusterDialogStateInjectable from "./state.injectable";
import type { RequestSetClusterAsDeleting } from "../../../features/cluster/delete-dialog/renderer/request-set-as-deleting.injectable";
import requestSetClusterAsDeletingInjectable from "../../../features/cluster/delete-dialog/renderer/request-set-as-deleting.injectable";
import type { RequestClearClusterAsDeleting } from "../../../features/cluster/delete-dialog/renderer/request-clear-as-deleting.injectable";
import requestClearClusterAsDeletingInjectable from "../../../features/cluster/delete-dialog/renderer/request-clear-as-deleting.injectable";
import type { RequestDeleteCluster } from "../../../features/cluster/delete-dialog/renderer/request-delete.injectable";
import requestDeleteClusterInjectable from "../../../features/cluster/delete-dialog/renderer/request-delete.injectable";
import type { SaveKubeconfig } from "./save-kubeconfig.injectable";
import saveKubeconfigInjectable from "./save-kubeconfig.injectable";
import { showErrorNotificationInjectable } from "@k8slens/notifications";
import { isCurrentContext } from "./is-current-context";
import type { IsInLocalKubeconfig } from "./is-in-local-kubeconfig.injectable";
import isInLocalKubeconfigInjectable from "./is-in-local-kubeconfig.injectable";
import type { RemoveEntityFromAllHotbars } from "../../../features/hotbar/storage/common/remove-entity-from-all.injectable";
import removeEntityFromAllHotbarsInjectable from "../../../features/hotbar/storage/common/remove-entity-from-all.injectable";

interface Dependencies {
  state: IObservableValue<DeleteClusterDialogState | undefined>;
  requestSetClusterAsDeleting: RequestSetClusterAsDeleting;
  requestDeleteCluster: RequestDeleteCluster;
  requestClearClusterAsDeleting: RequestClearClusterAsDeleting;
  showErrorNotification: ShowNotification;
  saveKubeconfig: SaveKubeconfig;
  isInLocalKubeconfig: IsInLocalKubeconfig;
  removeEntityFromAllHotbars: RemoveEntityFromAllHotbars;
}

@observer
class NonInjectedDeleteClusterDialog extends React.Component<Dependencies> {
  async onDelete(state: DeleteClusterDialogState) {
    const { cluster, config, newCurrentContext, showContextSwitch } = state;

    await this.props.requestSetClusterAsDeleting(cluster.id);

    runInAction(() => {
      this.props.state.set({
        ...state,
        config: Object.assign(config, {
          contexts: config.contexts.filter(item => item.name !== state.cluster.contextName.get()),
          currentContext: newCurrentContext && showContextSwitch
            ? newCurrentContext
            : config.currentContext,
        }),
      });
    });

    try {
      await this.props.saveKubeconfig(config, cluster.kubeConfigPath.get());
      this.props.removeEntityFromAllHotbars(cluster.id);
      await this.props.requestDeleteCluster(cluster.id);
    } catch(error) {
      this.props.showErrorNotification(`Cannot remove cluster, failed to process config file. ${error}`);
    } finally {
      await this.props.requestClearClusterAsDeleting(cluster.id);
      this.close();
    }
  }

  shouldDeleteBeDisabled({ cluster, config, newCurrentContext, showContextSwitch }: DeleteClusterDialogState): boolean {
    const noContextsAvailable = config.contexts.filter(context => context.name !== cluster.contextName.get()).length == 0;
    const newContextNotSelected = newCurrentContext === "";

    if (noContextsAvailable) {
      return false;
    }

    return showContextSwitch && newContextNotSelected;
  }

  renderCurrentContextSwitch(state: DeleteClusterDialogState) {
    const { cluster, config, showContextSwitch, newCurrentContext } = state;

    if (!showContextSwitch) {
      return null;
    }

    const selectOptions = config
      .contexts
      .filter(context => context.name !== cluster.contextName.get())
      .map(context => ({
        value: context.name,
        label: context.name,
      }));

    return (
      <div className="mt-4">
        <Select
          id="delete-cluster-input"
          options={selectOptions}
          value={newCurrentContext}
          onChange={opt => {
            if (opt) {
              this.props.state.set({
                ...state,
                newCurrentContext: opt.value,
              });
            }
          }}
          themeName="light"
          className="ml-[1px] mr-[1px]"
          placeholder="Select new context..."
        />
      </div>
    );
  }

  renderDeleteMessage({ cluster }: DeleteClusterDialogState) {
    if (this.props.isInLocalKubeconfig(cluster)) {
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
          {cluster.kubeConfigPath.get()}
        </b>
        ?
      </div>
    );
  }

  getWarningMessage({ cluster, config }: DeleteClusterDialogState) {
    if (this.props.isInLocalKubeconfig(cluster)) {
      return (
        <p data-testid="internal-kubeconfig-warning">
          Are you sure you want to delete it? It can be re-added through the copy/paste mechanism.
        </p>
      );
    }

    const contexts = config.contexts.filter(context => context.name !== cluster.contextName.get());

    if (!contexts.length) {
      return (
        <p data-testid="no-more-contexts-warning">
          This will remove the last context in kubeconfig. There will be no active context.
        </p>
      );
    }

    if (isCurrentContext(config, cluster)) {
      return (
        <p data-testid="current-context-warning">
          This will remove active context in kubeconfig. Use drop down below to&nbsp;select a&nbsp;different one.
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
    const { config, cluster, showContextSwitch } = state;
    const contexts = state.config.contexts.filter(context => context.name !== state.cluster.contextName.get());
    const disableDelete = this.shouldDeleteBeDisabled(state);
    const currentContext = isCurrentContext(config, cluster);

    return (
      <>
        <div className={styles.dialogContent}>
          {this.renderDeleteMessage(state)}
          {this.renderWarning(state)}
          {contexts.length > 0 && (
            <>
              <hr className={styles.hr} />
              <div className="mt-4">
                <Checkbox
                  data-testid="delete-cluster-dialog-context-switch"
                  label={(
                    <>
                      <span className="font-semibold">Select current-context</span>
                      {" "}
                      {!currentContext && "(optional)"}
                    </>
                  )}
                  value={showContextSwitch}
                  onChange={value => {
                    this.props.state.set({
                      ...state,
                      showContextSwitch: currentContext || value,
                    });
                  }}
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
        data-testid={state ? "delete-cluster-dialog" : undefined}
      >
        {state && this.renderContents(state)}
      </Dialog>
    );
  }
}

export const DeleteClusterDialog = withInjectables<Dependencies>(NonInjectedDeleteClusterDialog, {
  getProps: (di) => ({
    state: di.inject(deleteClusterDialogStateInjectable),
    requestSetClusterAsDeleting: di.inject(requestSetClusterAsDeletingInjectable),
    requestClearClusterAsDeleting: di.inject(requestClearClusterAsDeletingInjectable),
    requestDeleteCluster: di.inject(requestDeleteClusterInjectable),
    saveKubeconfig: di.inject(saveKubeconfigInjectable),
    showErrorNotification: di.inject(showErrorNotificationInjectable),
    isInLocalKubeconfig: di.inject(isInLocalKubeconfigInjectable),
    removeEntityFromAllHotbars: di.inject(removeEntityFromAllHotbarsInjectable),
  }),
});
