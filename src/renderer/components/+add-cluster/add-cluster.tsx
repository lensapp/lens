import "./add-cluster.scss";
import os from "os";
import React from "react";
import { observer } from "mobx-react";
import { action, observable, runInAction } from "mobx";
import { remote } from "electron";
import { KubeConfig } from "@kubernetes/client-node";
import { Select, SelectOption } from "../select";
import { DropFileInput, Input } from "../input";
import { AceEditor } from "../ace-editor";
import { Button } from "../button";
import { Icon } from "../icon";
import { kubeConfigDefaultPath, loadConfig, splitConfig, validateConfig, validateKubeConfig } from "../../../common/kube-helpers";
import { ClusterModel, ClusterStore, clusterStore } from "../../../common/cluster-store";
import { v4 as uuid } from "uuid";
import { navigate } from "../../navigation";
import { userStore } from "../../../common/user-store";
import { cssNames } from "../../utils";
import { Notifications } from "../notifications";
import { Tab, Tabs } from "../tabs";
import { ExecValidationNotFoundError } from "../../../common/custom-errors";
import { appEventBus } from "../../../common/event-bus";
import { PageLayout } from "../layout/page-layout";
import { docsUrl } from "../../../common/vars";
import { catalogURL } from "../+catalog";

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
  @observable customConfig = "";
  @observable proxyServer = "";
  @observable isWaiting = false;
  @observable showSettings = false;

  componentDidMount() {
    clusterStore.setActive(null);
    this.setKubeConfig(userStore.kubeConfigPath);
    appEventBus.emit({ name: "cluster-add", action: "start" });
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
      if (!userStore.isDefaultKubeConfigPath) {
        Notifications.error(
          <div>Can&apos;t setup <code>{filePath}</code> as kubeconfig: {String(err)}</div>
        );
      }

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
          this.error = "";
          const contexts = this.getContexts(loadConfig(this.customConfig || "{}"));

          this.kubeContexts.replace(contexts);
        } catch (err) {
          this.error = String(err);
        }
        break;
    }

    if (this.kubeContexts.size === 1) {
      this.selectedContexts.push(this.kubeContexts.keys().next().value);
    }
  }

  getContexts(config: KubeConfig): Map<string, KubeConfig> {
    const contexts = new Map();

    splitConfig(config).forEach(config => {
      contexts.set(config.currentContext, config);
    });

    return contexts;
  }

  selectKubeConfigDialog = async () => {
    const { dialog, BrowserWindow } = remote;
    const { canceled, filePaths } = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
      defaultPath: this.kubeConfigPath,
      properties: ["openFile", "showHiddenFiles"],
      message: `Select custom kubeconfig file`,
      buttonLabel: `Use configuration`,
    });

    if (!canceled && filePaths.length) {
      this.setKubeConfig(filePaths[0]);
    }
  };

  onDropKubeConfig = (files: File[]) => {
    this.sourceTab = KubeConfigSourceTab.FILE;
    this.setKubeConfig(files[0].path);
  };

  @action
  addClusters = () => {
    let newClusters: ClusterModel[] = [];

    try {
      if (!this.selectedContexts.length) {
        this.error = "Please select at least one cluster context";

        return;
      }
      this.error = "";
      this.isWaiting = true;
      appEventBus.emit({ name: "cluster-add", action: "click" });
      newClusters = this.selectedContexts.filter(context => {
        try {
          const kubeConfig = this.kubeContexts.get(context);

          validateKubeConfig(kubeConfig, context);

          return true;
        } catch (err) {
          this.error = String(err.message);

          if (err instanceof ExecValidationNotFoundError) {
            Notifications.error(<>Error while adding cluster(s): {this.error}</>);

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
          kubeConfigPath,
          contextName: kubeConfig.currentContext,
          preferences: {
            clusterName: kubeConfig.currentContext,
            httpsProxy: this.proxyServer || undefined,
          },
        };
      });

      runInAction(() => {
        clusterStore.addClusters(...newClusters);

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
        Add clusters by clicking the <span className="text-primary">Add Cluster</span> button.
        You&apos;ll need to obtain a working kubeconfig for the cluster you want to add.
        You can either browse it from the file system or paste it as a text from the clipboard.
        Read more about adding clusters <a href={`${docsUrl}/latest/clusters/adding-clusters/`} rel="noreferrer" target="_blank">here</a>.
      </p>
    );
  }

  renderKubeConfigSource() {
    return (
      <>
        <Tabs onChange={this.onKubeConfigTabChange}>
          <Tab
            value={KubeConfigSourceTab.FILE}
            label="Select kubeconfig file"
            active={this.sourceTab == KubeConfigSourceTab.FILE}/>
          <Tab
            value={KubeConfigSourceTab.TEXT}
            label="Paste as text"
            active={this.sourceTab == KubeConfigSourceTab.TEXT}
          />
        </Tabs>
        {this.sourceTab === KubeConfigSourceTab.FILE && (
          <div>
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
                  tooltip="Reset"
                />
              )}
              <Icon
                material="folder"
                onClick={this.selectKubeConfigDialog}
                tooltip="Browse"
              />
            </div>
            <small className="hint">
              Pro-Tip: you can also drag-n-drop kubeconfig file to this area
            </small>
          </div>
        )}
        {this.sourceTab === KubeConfigSourceTab.TEXT && (
          <div className="flex column">
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
              Pro-Tip: paste kubeconfig to get available contexts
            </small>
          </div>
        )}
      </>
    );
  }

  renderContextSelector() {
    const allContexts = Array.from(this.kubeContexts.keys());
    const placeholder = this.selectedContexts.length > 0
      ? <>Selected contexts: <b>{this.selectedContexts.length}</b></>
      : "Select contexts";

    return (
      <div>
        <Select
          id="kubecontext-select" // todo: provide better mapping for integration tests (e.g. data-test-id="..")
          placeholder={placeholder}
          controlShouldRenderValue={false}
          closeMenuOnSelect={false}
          isOptionSelected={() => false}
          options={allContexts}
          formatOptionLabel={this.formatContextLabel}
          noOptionsMessage={() => `No contexts available or they have been added already`}
          onChange={({ value: ctx }: SelectOption<string>) => {
            if (this.selectedContexts.includes(ctx)) {
              this.selectedContexts.remove(ctx);
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
      </div>
    );
  }

  onKubeConfigInputBlur = () => {
    const isChanged = this.kubeConfigPath !== userStore.kubeConfigPath;

    if (isChanged) {
      this.kubeConfigPath = this.kubeConfigPath.replace("~", os.homedir());

      try {
        this.setKubeConfig(this.kubeConfigPath, { throwError: true });
      } catch (err) {
        this.setKubeConfig(userStore.kubeConfigPath); // revert to previous valid path
      }
    }
  };

  onKubeConfigTabChange = (tabId: KubeConfigSourceTab) => {
    this.sourceTab = tabId;
    this.error = "";
    this.refreshContexts();
  };

  protected formatContextLabel = ({ value: context }: SelectOption<string>) => {
    const isNew = userStore.newContexts.has(context);
    const isSelected = this.selectedContexts.includes(context);

    return (
      <div className={cssNames("kube-context flex gaps align-center", context)}>
        <span>{context}</span>
        {isNew && <Icon small material="fiber_new"/>}
        {isSelected && <Icon small material="check" className="box right"/>}
      </div>
    );
  };

  render() {
    const submitDisabled = this.selectedContexts.length === 0;

    return (
      <DropFileInput onDropFiles={this.onDropKubeConfig}>
        <PageLayout className="AddClusters" showOnTop={true}>
          <h2>Add Clusters from Kubeconfig</h2>
          {this.renderInfo()}
          {this.renderKubeConfigSource()}
          {this.renderContextSelector()}
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
              label={this.selectedContexts.length < 2 ? "Add cluster" : "Add clusters"}
              onClick={this.addClusters}
              waiting={this.isWaiting}
              tooltip={submitDisabled ? "Select at least one cluster to add." : undefined}
              tooltipOverrideDisabled
            />
          </div>
        </PageLayout>
      </DropFileInput>
    );
  }
}
