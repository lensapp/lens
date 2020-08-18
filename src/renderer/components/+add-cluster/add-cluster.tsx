import "./add-cluster.scss"
import React, { Fragment } from "react";
import { observer } from "mobx-react";
import { computed, observable } from "mobx";
import { KubeConfig } from "@kubernetes/client-node";
import { t, Trans } from "@lingui/macro";
import { _i18n } from "../../i18n";
import { Select, SelectOption } from "../select";
import { Input } from "../input";
import { AceEditor } from "../ace-editor";
import { Button } from "../button";
import { Icon } from "../icon";
import { WizardLayout } from "../layout/wizard-layout";
import { getKubeConfigLocal, loadConfig, saveConfigToAppFiles, splitConfig, validateConfig } from "../../../common/kube-helpers";
import { clusterStore } from "../../../common/cluster-store";
import { workspaceStore } from "../../../common/workspace-store";
import { v4 as uuid } from "uuid"
import { navigate } from "../../navigation";
import { userStore } from "../../../common/user-store";
import { clusterViewURL } from "../cluster-manager/cluster-view.route";

@observer
export class AddCluster extends React.Component {
  readonly custom: any = "custom"
  @observable.ref clusterConfig: KubeConfig;
  @observable.ref kubeConfig: KubeConfig; // local ~/.kube/config (if available)
  @observable.ref error: React.ReactNode;

  @observable isWaiting = false
  @observable showSettings = false
  @observable proxyServer = ""
  @observable customConfig = ""

  async componentDidMount() {
    const kubeConfig: string = await getKubeConfigLocal()
    if (kubeConfig) {
      this.kubeConfig = loadConfig(kubeConfig)
    }
  }

  componentWillUnmount() {
    userStore.markNewContextsAsSeen();
  }

  @computed get isCustom() {
    return this.clusterConfig === this.custom;
  }

  @computed get clusterOptions() {
    const options: SelectOption<KubeConfig>[] = [];
    if (this.kubeConfig) {
      splitConfig(this.kubeConfig).forEach(kubeConfig => {
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
    options.push({
      label: <Trans>Custom..</Trans>,
      value: this.custom,
    });
    return options;
  }

  protected formatClusterContextLabel = ({ value, label }: SelectOption<KubeConfig>) => {
    if (value instanceof KubeConfig) {
      const context = value.currentContext;
      const isNew = userStore.newContexts.has(context);
      const className = `${context} kube-context flex gaps align-center`
      return (
        <div className={className}>
          <span>{context}</span>
          {isNew && <Icon material="fiber_new"/>}
        </div>
      )
    }
    return label;
  };

  addCluster = async () => {
    const { clusterConfig, customConfig, proxyServer } = this;
    const clusterId = uuid();
    this.isWaiting = true
    this.error = ""
    try {
      const config = this.isCustom ? loadConfig(customConfig) : clusterConfig;
      if (!config) {
        this.error = <Trans>Please select kubeconfig</Trans>
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

  render() {
    return (
      <WizardLayout className="AddCluster" infoPanel={this.renderInfo()}>
        <h2><Trans>Add Cluster</Trans></h2>
        <p>Choose config:</p>
        <Select
          placeholder={<Trans>Select kubeconfig</Trans>}
          value={this.clusterConfig}
          options={this.clusterOptions}
          onChange={({ value }: SelectOption) => this.clusterConfig = value}
          formatOptionLabel={this.formatClusterContextLabel}
          id="kubecontext-select"
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
        {this.isCustom && (
          <div className="custom-kubeconfig flex column gaps box grow">
            <p>Kubeconfig:</p>
            <AceEditor
              autoFocus
              showGutter={false}
              mode="yaml"
              value={this.customConfig}
              onChange={value => this.customConfig = value}
            />
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
