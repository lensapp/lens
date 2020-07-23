import "./preferences.scss"
import React, { Fragment } from "react";
import { observer } from "mobx-react";
import { action, computed, observable } from "mobx";
import { t, Trans } from "@lingui/macro";
import { _i18n } from "../../i18n";
import { WizardLayout } from "../layout/wizard-layout";
import { Icon } from "../icon";
import { Select, SelectOption } from "../select";
import { userStore } from "../../../common/user-store";
import { HelmRepo, repoManager } from "../../../main/helm/helm-repo-manager";
import { Input } from "../input";
import { Checkbox } from "../checkbox";
import { Notifications } from "../notifications";
import { Badge } from "../badge";
import { Spinner } from "../spinner";
import { themeStore } from "../../theme.store";

@observer
export class Preferences extends React.Component {
  @observable helmLoading = false;
  @observable helmUpdating = false;
  @observable helmRepos: HelmRepo[] = [];
  @observable helmAddedRepos = observable.map<string, HelmRepo>();

  @observable downloadMirrorOptions: SelectOption<string>[] = [
    { value: "default", label: "Default (Google)" },
    { value: "china", label: "China (Azure)" },
  ]

  @computed get themeOptions(): SelectOption<string>[] {
    return themeStore.themes.map(theme => ({
      label: theme.name,
      value: theme.id,
    }))
  }

  @computed get helmOptions(): SelectOption<HelmRepo>[] {
    return this.helmRepos.map(repo => ({
      label: repo.name,
      value: repo,
    }))
  }

  async componentDidMount() {
    await this.loadHelmRepos();
  }

  @action
  async loadHelmRepos() {
    this.helmLoading = true;
    try {
      if (!this.helmRepos.length) {
        this.helmRepos = await repoManager.loadAvailableRepos(); // via https://helm.sh
      }
      const repos = await repoManager.repositories(); // via helm-cli
      this.helmAddedRepos.clear();
      repos.forEach(repo => this.helmAddedRepos.set(repo.name, repo));
    } catch (err) {
      Notifications.error(err);
    }
    this.helmLoading = false;
  }

  async addRepo(repo: HelmRepo) {
    try {
      await repoManager.addRepo(repo);
      this.helmAddedRepos.set(repo.name, repo);
    } catch (err) {
      Notifications.error(<Trans>Adding helm branch <b>{repo.name}</b> has failed: {String(err)}</Trans>)
    }
  }

  async removeRepo(repo: HelmRepo) {
    try {
      await repoManager.removeRepo(repo);
      this.helmAddedRepos.delete(repo.name);
    } catch (err) {
      Notifications.error(
        <Trans>Removing helm branch <b>{repo.name}</b> has failed: {String(err)}</Trans>
      )
    }
  }

  onThemeChange = ({ value }: SelectOption<string>) => {
    userStore.preferences.colorTheme = value;
  }

  onRepoSelect = async ({ value: repo }: SelectOption<HelmRepo>) => {
    const isAdded = this.helmAddedRepos.has(repo.name);
    if (isAdded) {
      Notifications.ok(<Trans>Helm branch <b>{repo.name}</b> already in use</Trans>)
      return;
    }
    this.helmUpdating = false;
    await this.addRepo(repo);
    this.helmUpdating = false;
  }

  formatHelmOptionLabel = ({ value: repo }: SelectOption<HelmRepo>) => {
    const isAdded = this.helmAddedRepos.has(repo.name);
    return (
      <div className="flex gaps">
        <span>{repo.name}</span>
        {isAdded && <Icon small material="check" className="box right"/>}
      </div>
    )
  }

  renderInfo() {
    return (
      <Fragment>
        <h2>
          <Trans>Preferences</Trans>
        </h2>
        <div className="info-block flex gaps align-flex-start">
          <Icon small material="info"/>
          <p>
            <Trans>Lens Global Settings</Trans> (<Trans>applicable to all clusters</Trans>)
          </p>
        </div>
      </Fragment>
    )
  }

  render() {
    const { preferences } = userStore;
    return (
      <WizardLayout className="Preferences" infoPanel={this.renderInfo()}>
        <h2><Trans>Color Theme</Trans></h2>
        <Select
          options={this.themeOptions}
          value={preferences.colorTheme}
          onChange={({ value }: SelectOption) => preferences.colorTheme = value}
        />

        <h2><Trans>Download Mirror</Trans></h2>
        <Select
          placeholder={<Trans>Download mirror for kubectl</Trans>}
          options={this.downloadMirrorOptions}
          value={preferences.downloadMirror}
          onChange={({ value }: SelectOption) => preferences.downloadMirror = value}
        />

        <h2><Trans>Helm</Trans></h2>
        <Select
          placeholder={<Trans>Repositories</Trans>}
          isLoading={this.helmLoading}
          isDisabled={this.helmUpdating}
          options={this.helmOptions}
          onChange={this.onRepoSelect}
          formatOptionLabel={this.formatHelmOptionLabel}
          controlShouldRenderValue={false}
        />
        <div className="repos flex gaps align-center">
          <div className="title">
            <Trans>Added repos:</Trans>
          </div>
          <div className="repos-list">
            {this.helmLoading && <Spinner/>}
            {Array.from(this.helmAddedRepos).map(([name, repo]) => {
              return (
                <Badge key={name} className="added-repo flex gaps align-center" title={repo.url}>
                  <span className="repo">{name}</span>
                  <Icon
                    material="remove_circle_outline"
                    onClick={() => this.removeRepo(repo)}
                    tooltip={<Trans>Remove</Trans>}
                  />
                </Badge>
              )
            })}
          </div>
        </div>

        <h2><Trans>HTTP Proxy</Trans></h2>
        <Input
          placeholder={_i18n._(t`Type HTTP proxy url (example: http://proxy.acme.org:8080)`)}
          value={preferences.httpsProxy}
          onChange={v => preferences.httpsProxy = v}
        />
        <small className="hint">
          <Trans>Proxy is used only for non-cluster communication.</Trans>
        </small>

        <h2><Trans>Certificate Trust</Trans></h2>
        <Checkbox
          label={<Trans>Allow untrusted Certificate Authorities</Trans>}
          value={preferences.allowUntrustedCAs}
          onChange={v => preferences.allowUntrustedCAs = v}
        />
        <small className="hint">
          <Trans>This will make Lens to trust ANY certificate authority without any validations.</Trans>{" "}
          <Trans>Needed with some corporate proxies that do certificate re-writing.</Trans>{" "}
          <Trans>Does not affect cluster communications!</Trans>
        </small>

        <h2><Trans>Telemetry & Usage Tracking</Trans></h2>
        <Checkbox
          label={<Trans>Allow telemetry & usage tracking</Trans>}
          value={preferences.allowTelemetry}
          onChange={v => preferences.allowTelemetry = v}
        />
        <small className="hint">
          <Trans>Telemetry & usage data is collected to continuously improve the Lens experience.</Trans>
        </small>
      </WizardLayout>
    )
  }
}
