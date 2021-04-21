import semver from "semver";
import { observable } from "mobx";
import { autobind } from "../../utils";
import { getChartDetails, HelmChart, listCharts } from "../../api/endpoints/helm-charts.api";
import { ItemStore } from "../../item.store";
import flatten from "lodash/flatten";

export interface IChartVersion {
  repo: string;
  version: string;
}

@autobind()
export class HelmChartStore extends ItemStore<HelmChart> {
  @observable versions = observable.map<string, IChartVersion[]>();

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
    return versions.sort((first, second) => {
      const firstVersion = semver.coerce(first.version || 0);
      const secondVersion = semver.coerce(second.version || 0);

      return semver.compare(secondVersion, firstVersion);
    });
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
        version: chart.getVersion()
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
