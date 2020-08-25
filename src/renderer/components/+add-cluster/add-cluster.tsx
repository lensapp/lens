import "./add-cluster.scss"
import os from "os";
import React, { Fragment } from "react";
import { observer } from "mobx-react";
import { computed, observable } from "mobx";
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
import { kubeConfigDefaultPath, loadConfig, saveConfigToAppFiles, splitConfig, validateConfig } from "../../../common/kube-helpers";
import { clusterStore } from "../../../common/cluster-store";
import { workspaceStore } from "../../../common/workspace-store";
import { v4 as uuid } from "uuid"
import { navigate } from "../../navigation";
import { userStore } from "../../../common/user-store";
import { clusterViewURL } from "../cluster-manager/cluster-view.route";
import { cssNames } from "../../utils";
import { Notifications } from "../notifications";
import { Tab, Tabs } from "../tabs";

enum KubeConfigSourceTab {
  FILE = "file",
  TEXT = "text"
}

@observer
export class AddCluster extends React.Component {
  @observable.ref localKubeConfig: KubeConfig;
  @observable.ref newClusterConfig: KubeConfig;
  @observable.ref error: React.ReactNode;

  @observable kubeConfigPath = "";
  @observable sourceTab = KubeConfigSourceTab.FILE;
  @observable isWaiting = false
  @observable showSettings = false
  @observable dropAreaActive = false;
  @observable proxyServer = ""
  @observable customConfig = ""

  componentDidMount() {
    this.setKubeConfig(userStore.kubeConfigPath);
  }

  componentWillUnmount() {
    userStore.markNewContextsAsSeen();
  }

  protected setKubeConfig(filePath: string, { saveGlobal = true, throwError = false } = {}) {
    try {
      const kubeConfig = loadConfig(filePath);
      validateConfig(kubeConfig);
      this.kubeConfigPath = filePath;
      this.localKubeConfig = kubeConfig;
      this.newClusterConfig = null; // reset previously selected
      if (saveGlobal) {
        userStore.kubeConfigPath = filePath; // save to store
      }
    } catch (err) {
      Notifications.error(
        <p>Can't read config file in <em>{filePath}</em>: {String(err)}</p>
      );
      if (throwError) {
        throw err;
      }
    }
  }

  onKubeConfigInputBlur = () => {
    const isChanged = this.kubeConfigPath !== userStore.kubeConfigPath;
    if (isChanged) {
      this.kubeConfigPath = this.kubeConfigPath.replace("~", os.homedir());
      try {
        this.setKubeConfig(this.kubeConfigPath, { throwError: true })
      } catch (err) {
        Notifications.info(<p>
          <Trans>Resetting config to {userStore.kubeConfigPath}</Trans>
        </p>, { timeout: 2500 });
        this.setKubeConfig(userStore.kubeConfigPath);
      }
    }
  }

  selectKubeConfig = async () => {
    const { dialog, BrowserWindow } = remote;
    const { canceled, filePaths } = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
      defaultPath: this.kubeConfigPath,
      properties: ["openFile", "showHiddenFiles"],
      message: _i18n._(t`Select custom kube-config file`),
      buttonLabel: _i18n._(t`Use configuration`),
    });
    if (!canceled && filePaths.length) {
      this.setKubeConfig(filePaths[0]);
    }
  }

  resetKubeConfig = () => {
    this.setKubeConfig(kubeConfigDefaultPath);
  }

  @computed get clusterOptions() {
    const options: SelectOption<KubeConfig>[] = [];
    if (this.localKubeConfig) {
      splitConfig(this.localKubeConfig).forEach(kubeConfig => {
        const context = kubeConfig.currentContext;
        const hasContext = clusterStore.hasContext(context);
        if (!hasContext) {
          options.push({
            value: kubeConfig,
            label: context,
          });
        }
      })
    }
    return options;
  }

  protected formatClusterContextLabel = ({ value, label }: SelectOption<KubeConfig>) => {
    if (value instanceof KubeConfig) {
      const context = value.currentContext;
      const isNew = userStore.newContexts.has(context);
      return (
        <div className={cssNames("kube-context flex gaps align-center", context)}>
          <span>{context}</span>
          {isNew && <Icon material="fiber_new"/>}
        </div>
      )
    }
    return label;
  };

  // fixme: allow to create multiple clusters at once (multi-select)
  addCluster = async () => {
    const { newClusterConfig, customConfig, proxyServer } = this;
    const clusterId = uuid();
    this.isWaiting = true
    this.error = ""
    try {
      const config = this.sourceTab == KubeConfigSourceTab.TEXT ? loadConfig(customConfig) : newClusterConfig;
      if (!config) {
        this.error = <Trans>Please select kube-config's context</Trans>
        return;
      }
      validateConfig(config);
      await clusterStore.addCluster({
        id: clusterId,
        kubeConfigPath: saveConfigToAppFiles(clusterId, config),
        workspace: workspaceStore.currentWorkspaceId,
        contextName: config.currentContext,
        preferences: {
          clusterName: config.currentContext,
          httpsProxy: proxyServer || undefined,
        },
      });
      navigate(clusterViewURL({ params: { clusterId } }))
    } catch (err) {
      this.error = String(err);
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
          You'll need to obtain a working kubeconfig for the cluster you want to add.
        </p>
        <p>
          Each <a href="https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/#context" target="_blank">cluster context</a> is added as a separate item in the
          left-side cluster menu
          to allow you to operate easily on multiple clusters and/or contexts.
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
        <a href="https://kubernetes.io/docs/reference/access-authn-authz/authentication/#option-1-oidc-authenticator" target="_blank">
          <h3>OIDC (OpenID Connect)</h3>
        </a>
        <p>
          When connecting Lens to OIDC enabled cluster, there's few things you as a user need to take into account.
        </p>
        <p><b>Dedicated refresh token</b></p>
        <p>
          As Lens app utilized kubeconfig is "disconnected" from your main kubeconfig Lens needs to have it's own refresh token it utilizes.
          If you share the refresh token with e.g. <code>kubectl</code> who ever uses the token first will invalidate it for the next user.
          One way to achieve this is with <a href="https://github.com/int128/kubelogin" target="_blank">kubelogin</a> tool by removing the tokens
          (both <code>id_token</code> and <code>refresh_token</code>) from
          the config and issuing <code>kubelogin</code> command. That'll take you through the login process and will result you having "dedicated" refresh token.
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
        <Tabs withBorder onChange={v => this.sourceTab = v}>
          <Tab
            value={KubeConfigSourceTab.FILE}
            label={<Trans>Select kube-config file</Trans>}
            active={this.sourceTab == KubeConfigSourceTab.FILE}/>
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
                  onClick={this.resetKubeConfig}
                  tooltip={<Trans>Reset</Trans>}
                />
              )}
              <Icon
                material="folder"
                onClick={this.selectKubeConfig}
                tooltip={<Trans>Browse</Trans>}
              />
            </div>
            <small className="hint">
              <Trans>Pro-tip: you can also drag-n-drop kube-config file to this area</Trans>
            </small>
          </>
        )}
        {this.sourceTab === KubeConfigSourceTab.TEXT && (
          <AceEditor
            autoFocus
            showGutter={false}
            mode="yaml"
            value={this.customConfig}
            onChange={value => this.customConfig = value}
          />
        )}
      </>
    )
  }

  render() {
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
            this.dropAreaActive = false
            this.setKubeConfig(event.dataTransfer.files[0].path)
          }
        }}
      >
        <h2><Trans>Add Cluster</Trans></h2>
        {this.renderKubeConfigSource()}
        <Select
          id="kubecontext-select" // todo: provide better mapping for integration tests (e.g. data-test-id="..")
          placeholder={<Trans>Select a context</Trans>}
          value={this.newClusterConfig}
          options={this.clusterOptions}
          onChange={({ value }: SelectOption) => this.newClusterConfig = value}
          formatOptionLabel={this.formatClusterContextLabel}
        />
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
            label={<Trans>Add cluster(s)</Trans>}
            onClick={this.addCluster}
            waiting={this.isWaiting}
          />
        </div>
      </WizardLayout>
    )
  }
}
