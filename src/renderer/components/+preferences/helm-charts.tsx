/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import styles from "./helm-charts.module.css";

import React from "react";
import { action, computed, observable, makeObservable } from "mobx";

import { HelmRepo, HelmRepoManager } from "../../../main/helm/helm-repo-manager";
import { Button } from "../button";
import { Icon } from "../icon";
import { Notifications } from "../notifications";
import { Select, SelectOption } from "../select";
import { AddHelmRepoDialog } from "./add-helm-repo-dialog";
import { observer } from "mobx-react";
import { RemovableItem } from "./removable-item";
import { Notice } from "../+extensions/notice";
import { Spinner } from "../spinner";

@observer
export class HelmCharts extends React.Component {
  @observable loading = false;
  @observable repos: HelmRepo[] = [];
  @observable addedRepos = observable.map<string, HelmRepo>();

  constructor(props: {}) {
    super(props);
    makeObservable(this);
  }

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
        this.repos = await HelmRepoManager.loadAvailableRepos();
      }
      const repos = await HelmRepoManager.getInstance().repositories(); // via helm-cli

      this.addedRepos.clear();
      repos.forEach(repo => this.addedRepos.set(repo.name, repo));
    } catch (err) {
      Notifications.error(String(err));
    }

    this.loading = false;
  }

  async addRepo(repo: HelmRepo) {
    try {
      await HelmRepoManager.addRepo(repo);
      this.addedRepos.set(repo.name, repo);
    } catch (err) {
      Notifications.error(<>Adding helm branch <b>{repo.name}</b> has failed: {String(err)}</>);
    }
  }

  async removeRepo(repo: HelmRepo) {
    try {
      await HelmRepoManager.removeRepo(repo);
      this.addedRepos.delete(repo.name);
    } catch (err) {
      Notifications.error(
        <>Removing helm branch <b>{repo.name}</b> has failed: {String(err)}</>,
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

  renderRepositories() {
    const repos = Array.from(this.addedRepos);

    if (this.loading) {
      return <div className="pt-5 relative"><Spinner center/></div>;
    }

    if (!repos.length) {
      return (
        <Notice>
          <div className="flex-grow text-center">The repositories have not been added yet</div>
        </Notice>
      );
    }

    return repos.map(([name, repo]) => {
      return (
        <RemovableItem key={name} onRemove={() => this.removeRepo(repo)} className="mt-3">
          <div>
            <div data-testid="repository-name" className={styles.repoName}>{name}</div>
            <div className={styles.repoUrl}>{repo.url}</div>
          </div>
        </RemovableItem>
      );
    });
  }

  render() {
    return (
      <div>
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
            themeName="lens"
          />
          <Button
            primary
            label="Add Custom Helm Repo"
            onClick={AddHelmRepoDialog.open}
          />
        </div>
        <AddHelmRepoDialog onAddRepo={() => this.loadRepos()}/>
        <div className={styles.repos}>
          {this.renderRepositories()}
        </div>
      </div>
    );
  }
}
