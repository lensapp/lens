import "./add-cluster.scss"
import os from "os";
import React, { Fragment } from "react";
import { observer } from "mobx-react";
import { action, observable, runInAction } from "mobx";
import { remote } from "electron";
import { KubeConfig } from "@kubernetes/client-node";
import { _i18n } from "../../i18n";
import { t, Trans } from "@lingui/macro";
import { Select, SelectOption } from "../select";
import { Input } from "../input";
import { AceEditor } from "../ace-editor";
import { Button } from "../button";
import { Icon } from "../icon";
import { WizardLayout } from "../layout/wizard-layout";
import { kubeConfigDefaultPath, loadConfig, splitConfig, validateConfig, validateKubeConfig } from "../../../common/kube-helpers";
import { ClusterModel, ClusterStore, clusterStore } from "../../../common/cluster-store";
import { workspaceStore } from "../../../common/workspace-store";
import { v4 as uuid } from "uuid"
import { navigate } from "../../navigation";
import { userStore } from "../../../common/user-store";
import { clusterViewURL } from "../cluster-manager/cluster-view.route";
import { cssNames } from "../../utils";
import { Notifications } from "../notifications";
import { Tab, Tabs } from "../tabs";
import { ExecValidationNotFoundError } from "../../../common/custom-errors";

enum KubeConfigSourceTab {
  FILE = "file",
  TEXT = "text"
}

@observer
export class AddCluster extends React.Component {
  @observable.ref kubeConfigLocal: KubeConfig;
  @observable.ref error: React.ReactNode;

  @observable kubeContexts = observable.map<string, KubeConfig>(); // available contexts from kubeconfig-file or user-input
  @observable selectedContexts = observable.array<string>();
  @observable sourceTab = KubeConfigSourceTab.FILE;
  @observable kubeConfigPath = "";
  @observable customConfig = ""
  @observable proxyServer = ""
  @observable isWaiting = false
  @observable showSettings = false
  @observable dropAreaActive = false;

  componentDidMount() {
    clusterStore.setActive(null);
    this.setKubeConfig(userStore.kubeConfigPath);
  }

  componentWillUnmount() {
    userStore.markNewContextsAsSeen();
  }

  @action
  setKubeConfig(filePath: string, { throwError = false } = {}) {
    try {
      this.kubeConfigLocal = loadConfig(filePath);
      validateConfig(this.kubeConfigLocal);
      this.refreshContexts();
      this.kubeConfigPath = filePath;
      userStore.kubeConfigPath = filePath; // save to store
    } catch (err) {
      Notifications.error(
        <div>Can't setup <code>{filePath}</code> as kubeconfig: {String(err)}</div>
      );
      if (throwError) {
        throw err;
      }
    }
  }

  @action
  refreshContexts() {
    this.selectedContexts.clear();
    this.kubeContexts.clear();

    switch (this.sourceTab) {
    case KubeConfigSourceTab.FILE:
      const contexts = this.getContexts(this.kubeConfigLocal);
      this.kubeContexts.replace(contexts);
      break;
    case KubeConfigSourceTab.TEXT:
      try {
        this.error = ""
        const contexts = this.getContexts(loadConfig(this.customConfig || "{}"));
        this.kubeContexts.replace(contexts);
      } catch (err) {
        this.error = String(err);
      }
      break;
    }

    if (this.kubeContexts.size === 1) {
      this.selectedContexts.push(this.kubeContexts.keys().next().value)
    }
  }

  getContexts(config: KubeConfig): Map<string, KubeConfig> {
    const contexts = new Map();
    splitConfig(config).forEach(config => {
      contexts.set(config.currentContext, config);
    })
    return contexts
  }

  selectKubeConfigDialog = async () => {
    const { dialog, BrowserWindow } = remote;
    const { canceled, filePaths } = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
      defaultPath: this.kubeConfigPath,
      properties: ["openFile", "showHiddenFiles"],
      message: _i18n._(t`Select custom kubeconfig file`),
      buttonLabel: _i18n._(t`Use configuration`),
    });
    if (!canceled && filePaths.length) {
      this.setKubeConfig(filePaths[0]);
    }
  }

  @action
  addClusters = () => {
    let newClusters: ClusterModel[] = [];
    try {
      if (!this.selectedContexts.length) {
        this.error = <Trans>Please select at least one cluster context</Trans>
        return;
      }
      this.error = ""
      this.isWaiting = true

      newClusters = this.selectedContexts.filter(context => {
        try {
          const kubeConfig = this.kubeContexts.get(context);
          validateKubeConfig(kubeConfig);
          return true;
        } catch (err) {
          this.error = String(err.message)
          if (err instanceof ExecValidationNotFoundError ) {
            Notifications.error(<Trans>Error while adding cluster(s): {this.error}</Trans>);
            return false;
          } else {
            throw new Error(err);
          }
        }
      }).map(context => {
        const clusterId = uuid();
        const kubeConfig = this.kubeContexts.get(context);
        const kubeConfigPath = this.sourceTab === KubeConfigSourceTab.FILE
          ? this.kubeConfigPath // save link to original kubeconfig in file-system
          : ClusterStore.embedCustomKubeConfig(clusterId, kubeConfig); // save in app-files folder
        return {
          id: clusterId,
          kubeConfigPath: kubeConfigPath,
          workspace: workspaceStore.currentWorkspaceId,
          contextName: kubeConfig.currentContext,
          preferences: {
            clusterName: kubeConfig.currentContext,
            httpsProxy: this.proxyServer || undefined,
          },
        }
      })

      runInAction(() => {
        clusterStore.addClusters(...newClusters);
        if (newClusters.length === 1) {
          const clusterId = newClusters[0].id;
          clusterStore.setActive(clusterId);
          navigate(clusterViewURL({ params: { clusterId } }));
        } else {
          if (newClusters.length > 1) {
            Notifications.ok(
              <Trans>Successfully imported <b>{newClusters.length}</b> cluster(s)</Trans>
            );
          }
        }
      })
      this.refreshContexts();
    } catch (err) {
      this.error = String(err);
      Notifications.error(<Trans>Error while adding cluster(s): {this.error}</Trans>);
    } finally {
      this.isWaiting = false;
    }
  }

  renderInfo() {
    return (
      <Fragment>
        <h2>Clusters associated with Lens</h2>
        <p>
          Add clusters by clicking the <span className="text-primary">Add Cluster</span> button.
          You'll need to obtain a working kubeconfig for the cluster you want to add. You can either browse it from the file system or paste it as a text from the clipboard.
        </p>
        <p>
          Selected <a href="https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/#context" target="_blank">cluster contexts</a> are added as a separate item in the
          left-side cluster menu to allow you to operate easily on multiple clusters and/or contexts.
        </p>
        <p>
          For more information on kubeconfig see <a href="https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/" target="_blank">Kubernetes docs</a>.
        </p>
        <p>
          NOTE: Any manually added cluster is not merged into your kubeconfig file.
        </p>
        <p>
          To see your currently enabled config with <code>kubectl</code>, use <code>kubectl config view --minify --raw</code> command in your terminal.
        </p>
        <p>
          When connecting to a cluster, make sure you have a valid and working kubeconfig for the cluster. Following lists known "gotchas" in some authentication types used in kubeconfig with Lens
          app.
        </p>
        <h3>Exec auth plugins</h3>
        <p>
          When using <a href="https://kubernetes.io/docs/reference/access-authn-authz/authentication/#configuration" target="_blank">exec auth</a> plugins make sure the paths that are used to call
          any binaries
          are full paths as Lens app might not be able to call binaries with relative paths. Make also sure that you pass all needed information either as arguments or env variables in the config,
          Lens app might not have all login shell env variables set automatically.
        </p>
      </Fragment>
    )
  }

  renderKubeConfigSource() {
    return (
      <>
        <Tabs withBorder onChange={this.onKubeConfigTabChange}>
          <Tab
            value={KubeConfigSourceTab.FILE}
            label={<Trans>Select kubeconfig file</Trans>}
            active={this.sourceTab == KubeConfigSourceTab.FILE} />
          <Tab
            value={KubeConfigSourceTab.TEXT}
            label={<Trans>Paste as text</Trans>}
            active={this.sourceTab == KubeConfigSourceTab.TEXT}
          />
        </Tabs>
        {this.sourceTab === KubeConfigSourceTab.FILE && (
          <>
            <div className="kube-config-select flex gaps align-center">
              <Input
                theme="round-black"
                className="kube-config-path box grow"
                value={this.kubeConfigPath}
                onChange={v => this.kubeConfigPath = v}
                onBlur={this.onKubeConfigInputBlur}
              />
              {this.kubeConfigPath !== kubeConfigDefaultPath && (
                <Icon
                  material="settings_backup_restore"
                  onClick={() => this.setKubeConfig(kubeConfigDefaultPath)}
                  tooltip={<Trans>Reset</Trans>}
                />
              )}
              <Icon
                material="folder"
                onClick={this.selectKubeConfigDialog}
                tooltip={<Trans>Browse</Trans>}
              />
            </div>
            <small className="hint">
              <Trans>Pro-Tip: you can also drag-n-drop kubeconfig file to this area</Trans>
            </small>
          </>
        )}
        {this.sourceTab === KubeConfigSourceTab.TEXT && (
          <>
            <AceEditor
              autoFocus
              showGutter={false}
              mode="yaml"
              value={this.customConfig}
              onChange={value => {
                this.customConfig = value;
                this.refreshContexts();
              }}
            />
            <small className="hint">
              <Trans>Pro-Tip: paste kubeconfig to get available contexts</Trans>
            </small>
          </>
        )}
      </>
    )
  }

  renderContextSelector() {
    const allContexts = Array.from(this.kubeContexts.keys());
    const placeholder = this.selectedContexts.length > 0
      ? <Trans>Selected contexts: <b>{this.selectedContexts.length}</b></Trans>
      : <Trans>Select contexts</Trans>;
    return (
      <>
        <Select
          id="kubecontext-select" // todo: provide better mapping for integration tests (e.g. data-test-id="..")
          placeholder={placeholder}
          controlShouldRenderValue={false}
          closeMenuOnSelect={false}
          isOptionSelected={() => false}
          options={allContexts}
          formatOptionLabel={this.formatContextLabel}
          noOptionsMessage={() => _i18n._(t`No contexts available or they have been added already`)}
          onChange={({ value: ctx }: SelectOption<string>) => {
            if (this.selectedContexts.includes(ctx)) {
              this.selectedContexts.remove(ctx)
            } else {
              this.selectedContexts.push(ctx);
            }
          }}
        />
        {this.selectedContexts.length > 0 && (
          <small className="hint">
            <span>Applying contexts:</span>{" "}
            <code>{this.selectedContexts.join(", ")}</code>
          </small>
        )}
      </>
    )
  }

  onKubeConfigInputBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
    const isChanged = this.kubeConfigPath !== userStore.kubeConfigPath;
    if (isChanged) {
      this.kubeConfigPath = this.kubeConfigPath.replace("~", os.homedir());
      try {
        this.setKubeConfig(this.kubeConfigPath, { throwError: true });
      } catch (err) {
        this.setKubeConfig(userStore.kubeConfigPath); // revert to previous valid path
      }
    }
  }

  onKubeConfigTabChange = (tabId: KubeConfigSourceTab) => {
    this.sourceTab = tabId;
    this.error = "";
    this.refreshContexts();
  }

  protected formatContextLabel = ({ value: context }: SelectOption<string>) => {
    const isNew = userStore.newContexts.has(context);
    const isSelected = this.selectedContexts.includes(context);
    return (
      <div className={cssNames("kube-context flex gaps align-center", context)}>
        <span>{context}</span>
        {isNew && <Icon small material="fiber_new" />}
        {isSelected && <Icon small material="check" className="box right" />}
      </div>
    )
  };

  render() {
    const addDisabled = this.selectedContexts.length === 0

    return (
      <WizardLayout
        className="AddCluster"
        infoPanel={this.renderInfo()}
        contentClass={{ droppable: this.dropAreaActive }}
        contentProps={{
          onDragEnter: event => this.dropAreaActive = true,
          onDragLeave: event => this.dropAreaActive = false,
          onDragOver: event => {
            event.preventDefault(); // enable onDrop()-callback
            event.dataTransfer.dropEffect = "move"
          },
          onDrop: event => {
            this.sourceTab = KubeConfigSourceTab.FILE;
            this.dropAreaActive = false
            this.setKubeConfig(event.dataTransfer.files[0].path)
          }
        }}
      >
        <h2><Trans>Add Cluster</Trans></h2>
        {this.renderKubeConfigSource()}
        {this.renderContextSelector()}
        <div className="cluster-settings">
          <a href="#" onClick={() => this.showSettings = !this.showSettings}>
            <Trans>Proxy settings</Trans>
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
              {'A HTTP proxy server URL (format: http://<address>:<port>).'}
            </small>
          </div>
        )}
        {this.error && (
          <div className="error">{this.error}</div>
        )}
        <div className="actions-panel">
          <Button
            primary
            disabled={addDisabled}
            label={<Trans>Add cluster(s)</Trans>}
            onClick={this.addClusters}
            waiting={this.isWaiting}
            tooltip={addDisabled ? _i18n._("Select at least one cluster to add.") : undefined}
            tooltipOverrideDisabled
          />
        </div>
      </WizardLayout>
    )
  }
}
