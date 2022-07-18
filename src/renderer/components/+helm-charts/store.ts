/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import semver from "semver";
import { observable, makeObservable } from "mobx";
import { autoBind, sortCompareChartVersions } from "../../utils";
import type { HelmChart } from "../../k8s/helm-chart";
import { ItemStore } from "../../../common/item.store";
import flatten from "lodash/flatten";
import type { ListHelmCharts } from "../../k8s/helm-charts.api/list.injectable";
import type { GetHelmChartDetails } from "../../k8s/helm-charts.api/get-details.injectable";

export interface ChartVersion {
  repo: string;
  version: string;
}

export interface HelmChartStoreDependencies {
  listHelmCharts: ListHelmCharts;
  getHelmChartDetails: GetHelmChartDetails;
}

export class HelmChartStore extends ItemStore<HelmChart> {
  @observable versions = observable.map<string, ChartVersion[]>();

  constructor(protected readonly dependencies: HelmChartStoreDependencies) {
    super();

    makeObservable(this);
    autoBind(this);
  }

  async loadAll() {
    try {
      const res = await this.loadItems(() => this.dependencies.listHelmCharts());

      this.failedLoading = false;

      return res;
    } catch (error) {
      this.failedLoading = true;

      throw error;
    }
  }

  getByName(name: string, repo?: string) {
    if (typeof repo !== "string") {
      /**
       * FIXME:
       * This is here because in strict mode `getByName` MUST be 100% compatiable if called in the
       * situation where it is only a "ItemStore"
       */
      throw new TypeError("repo must be provided");
    }

    return this.items.find(chart => chart.getName() === name && chart.getRepository() === repo);
  }

  protected sortVersions = (versions: ChartVersion[]) => {
    return versions
      .map(chartVersion => ({ ...chartVersion, __version: semver.coerce(chartVersion.version, { includePrerelease: true, loose: true }) }))
      .sort(sortCompareChartVersions)
      .map(({ __version, ...chartVersion }) => chartVersion);
  };

  async getVersions(chartName: string, force?: boolean): Promise<ChartVersion[]> {
    const versions = this.versions.get(chartName);

    if (versions && !force) {
      return versions;
    }

    const loadVersions = async (repo: string) => {
      const { versions } = await this.dependencies.getHelmChartDetails(repo, chartName);

      return versions.map(chart => ({
        repo,
        version: chart.getVersion(),
      }));
    };

    if (!this.isLoaded) {
      await this.loadAll();
    }
    const repos = this.items
      .filter(chart => chart.getName() === chartName)
      .map(chart => chart.getRepository());

    const newVersions = await Promise.all(repos.map(loadVersions))
      .then(flatten)
      .then(this.sortVersions);

    this.versions.set(chartName, newVersions);

    return newVersions;
  }

  reset() {
    super.reset();
    this.versions.clear();
  }

  /**
   * @deprecated Not supported
   */
  removeItems(): Promise<void> {
    throw new Error("removeItems is not supported");
  }
}
