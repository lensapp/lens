/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./helm-charts.module.scss";

import React from "react";
import { observable, makeObservable } from "mobx";

import type { HelmRepo } from "../../../main/helm/helm-repo-manager";
import { HelmRepoManager } from "../../../main/helm/helm-repo-manager";
import { Button } from "../button";
import { Icon } from "../icon";
import { Notifications } from "../notifications";
import { Select } from "../select";
import { AddHelmRepoDialog } from "./add-helm-repo-dialog";
import { observer } from "mobx-react";
import { RemovableItem } from "./removable-item";
import { Notice } from "../+extensions/notice";
import { Spinner } from "../spinner";
import { noop } from "../../utils";

@observer
export class HelmCharts extends React.Component {
  @observable loadingRepos = false;
  @observable loadingAvailableRepos = false;
  @observable repos: HelmRepo[] = [];
  @observable addedRepos = observable.map<string, HelmRepo>();

  constructor(props: {}) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    this.loadAvailableRepos().catch(noop);
    this.loadRepos().catch(noop);
  }

  async loadAvailableRepos() {
    this.loadingAvailableRepos = true;

    try {
      if (!this.repos.length) {
        this.repos = await HelmRepoManager.getInstance().loadAvailableRepos();
      }
    } catch (err) {
      Notifications.error(String(err));
    }

    this.loadingAvailableRepos = false;
  }

  async loadRepos() {
    this.loadingRepos = true;

    try {
      const repos = await HelmRepoManager.getInstance().repositories(); // via helm-cli

      this.addedRepos.replace(repos.map(repo => [repo.name, repo]));
    } catch (err) {
      Notifications.error(String(err));
    }

    this.loadingRepos = false;
  }

  async addRepo(repo: HelmRepo) {
    try {
      await HelmRepoManager.getInstance().addRepo(repo);
      this.addedRepos.set(repo.name, repo);
    } catch (err) {
      Notifications.error((
        <>
          {"Adding helm branch "}
          <b>{repo.name}</b>
          {" has failed: "}
          {String(err)}
        </>
      ));
    }
  }

  async removeRepo(repo: HelmRepo) {
    try {
      await HelmRepoManager.getInstance().removeRepo(repo);
      this.addedRepos.delete(repo.name);
    } catch (err) {
      Notifications.error(
        <>
          {"Removing helm branch "}
          <b>{repo.name}</b>
          {" has failed: "}
          {String(err)}
        </>,
      );
    }
  }

  onRepoSelect = async (repo: HelmRepo | null): Promise<void> => {
    if (!repo) {
      return;
    }

    if (this.addedRepos.has(repo.name)) {
      return void Notifications.ok((
        <>
          {"Helm repo "}
          <b>{repo.name}</b>
          {" already in use."}
        </>
      ));
    }

    await this.addRepo(repo);
  };

  formatOptionLabel = (repo: HelmRepo) => {
    const isAdded = this.addedRepos.has(repo.name);

    return (
      <div className="flex gaps">
        <span>{repo.name}</span>
        {isAdded && (
          <Icon
            small
            material="check"
            className="box right"
          />
        )}
      </div>
    );
  };

  renderRepositories() {
    const repos = Array.from(this.addedRepos);

    if (this.loadingRepos) {
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
        <RemovableItem
          key={name}
          onRemove={() => this.removeRepo(repo)}
          className="mt-3"
        >
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
          <Select
            id="HelmRepoSelect"
            placeholder="Repositories"
            isLoading={this.loadingAvailableRepos}
            isDisabled={this.loadingAvailableRepos}
            options={this.repos}
            onChange={this.onRepoSelect}
            formatOptionLabel={this.formatOptionLabel}
            getOptionLabel={repo => repo.name}
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
