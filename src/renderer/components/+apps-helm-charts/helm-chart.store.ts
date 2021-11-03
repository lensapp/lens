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

import semver from "semver";
import { observable, makeObservable } from "mobx";
import { autoBind, sortCompareChartVersions } from "../../utils";
import { getChartDetails, HelmChart, listCharts } from "../../../common/k8s-api/endpoints/helm-charts.api";
import { ItemStore } from "../../../common/item.store";
import flatten from "lodash/flatten";

export interface IChartVersion {
  repo: string;
  version: string;
}

export class HelmChartStore extends ItemStore<HelmChart> {
  @observable versions = observable.map<string, IChartVersion[]>();

  constructor() {
    super();

    makeObservable(this);
    autoBind(this);
  }

  async loadAll() {
    try {
      const res = await this.loadItems(() => listCharts());

      this.failedLoading = false;

      return res;
    } catch (error) {
      this.failedLoading = true;

      throw error;
    }
  }

  getByName(name: string, repo: string) {
    return this.items.find(chart => chart.getName() === name && chart.getRepository() === repo);
  }

  protected sortVersions = (versions: IChartVersion[]) => {
    return versions
      .map(chartVersion => ({ ...chartVersion, __version: semver.coerce(chartVersion.version, { includePrerelease: true, loose: true }) }))
      .sort(sortCompareChartVersions)
      .map(({ __version, ...chartVersion }) => chartVersion);
  };

  async getVersions(chartName: string, force?: boolean): Promise<IChartVersion[]> {
    let versions = this.versions.get(chartName);

    if (versions && !force) {
      return versions;
    }

    const loadVersions = async (repo: string) => {
      const { versions } = await getChartDetails(repo, chartName);

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

    versions = await Promise.all(repos.map(loadVersions))
      .then(flatten)
      .then(this.sortVersions);

    this.versions.set(chartName, versions);

    return versions;
  }

  reset() {
    super.reset();
    this.versions.clear();
  }
}

export const helmChartStore = new HelmChartStore();
