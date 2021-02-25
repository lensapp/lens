import "./helm-charts.scss";

import React from "react";
import { action, computed, observable } from "mobx";

import { HelmRepo, repoManager } from "../../../main/helm/helm-repo-manager";
import { Badge } from "../badge";
import { Button } from "../button";
import { Icon } from "../icon";
import { Notifications } from "../notifications";
import { Select, SelectOption } from "../select";
import { Tooltip } from "../tooltip";
import { AddHelmRepoDialog } from "./add-helm-repo-dialog";
import { observer } from "mobx-react";

@observer
export class HelmCharts extends React.Component {
  @observable loading = false;
  @observable repos: HelmRepo[] = [];
  @observable addedRepos = observable.map<string, HelmRepo>();

  @computed get options(): SelectOption<HelmRepo>[] {
    return this.repos.map(repo => ({
      label: repo.name,
      value: repo,
    }));
  }

  async componentDidMount() {
    await this.loadRepos();
  }

  @action
  async loadRepos() {
    this.loading = true;

    try {
      if (!this.repos.length) {
        this.repos = await repoManager.loadAvailableRepos(); // via https://helm.sh
      }
      const repos = await repoManager.repositories(); // via helm-cli

      this.addedRepos.clear();
      repos.forEach(repo => this.addedRepos.set(repo.name, repo));
    } catch (err) {
      Notifications.error(String(err));
    }

    this.loading = false;
  }

  async addRepo(repo: HelmRepo) {
    try {
      await repoManager.addRepo(repo);
      this.addedRepos.set(repo.name, repo);
    } catch (err) {
      Notifications.error(<>Adding helm branch <b>{repo.name}</b> has failed: {String(err)}</>);
    }
  }

  async removeRepo(repo: HelmRepo) {
    try {
      await repoManager.removeRepo(repo);
      this.addedRepos.delete(repo.name);
    } catch (err) {
      Notifications.error(
        <>Removing helm branch <b>{repo.name}</b> has failed: {String(err)}</>
      );
    }
  }

  onRepoSelect = async ({ value: repo }: SelectOption<HelmRepo>) => {
    const isAdded = this.addedRepos.has(repo.name);

    if (isAdded) {
      Notifications.ok(<>Helm branch <b>{repo.name}</b> already in use</>);

      return;
    }
    this.loading = true;
    await this.addRepo(repo);
    this.loading = false;
  };

  formatOptionLabel = ({ value: repo }: SelectOption<HelmRepo>) => {
    const isAdded = this.addedRepos.has(repo.name);

    return (
      <div className="flex gaps">
        <span>{repo.name}</span>
        {isAdded && <Icon small material="check" className="box right"/>}
      </div>
    );
  };

  render() {
    return (
      <div className="HelmCharts">
        <div className="flex gaps">
          <Select id="HelmRepoSelect"
            placeholder="Repositories"
            isLoading={this.loading}
            isDisabled={this.loading}
            options={this.options}
            onChange={this.onRepoSelect}
            formatOptionLabel={this.formatOptionLabel}
            controlShouldRenderValue={false}
            className="box grow"
          />
          <Button
            primary
            label="Add Custom Helm Repo"
            onClick={AddHelmRepoDialog.open}
          />
        </div>
        <AddHelmRepoDialog onAddRepo={() => this.loadRepos()}/>
        <div className="repos flex gaps column">
          {Array.from(this.addedRepos).map(([name, repo]) => {
            const tooltipId = `message-${name}`;

            return (
              <Badge key={name} className="added-repo flex gaps align-center justify-space-between">
                <span id={tooltipId} className="repo">{name}</span>
                <Icon
                  material="delete"
                  onClick={() => this.removeRepo(repo)}
                  tooltip="Remove"
                />
                <Tooltip targetId={tooltipId} formatters={{ narrow: true }}>
                  {repo.url}
                </Tooltip>
              </Badge>
            );
          })}
        </div>
      </div>
    );
  }
}
