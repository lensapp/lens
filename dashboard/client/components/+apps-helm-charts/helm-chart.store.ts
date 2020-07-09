import { observable } from "mobx";
import { autobind } from "../../utils";
import { HelmChart, helmChartsApi } from "../../api/endpoints/helm-charts.api";
import { ItemStore } from "../../item.store";
import flatten from "lodash/flatten";
import compareVersions from 'compare-versions';

export interface ChartVersion {
  repo: string;
  version: string;
}

@autobind()
export class HelmChartStore extends ItemStore<HelmChart> {
  @observable versions = observable.map<string, ChartVersion[]>();

  async loadAll(): Promise<void> {
    await this.loadItems(() => helmChartsApi.list());
  }

  getByName(desiredName: string, desiredRepo: string): HelmChart {
    return this.items.find(({ name, repo }) => desiredName === name && desiredRepo === repo);
  }

  protected sortVersions = (versions: ChartVersion[]): ChartVersion[] =>  {
    return versions.sort((first, second) => compareVersions(second.version, first.version));
  };

  async getVersions(chartName: string, force?: boolean): Promise<ChartVersion[]> {
    let versions = this.versions.get(chartName);
    if (versions && !force) {
      return versions;
    }
    const loadVersions = async (repo: string): Promise<ChartVersion[]> => {
      const { versions } = await helmChartsApi.get(repo, chartName);
      return versions.map(({version}) => ({ repo, version, }));
    };

    if (!this.isLoaded) {
      await this.loadAll();
    }

    const repos = this.items
      .filter(chart => chart.getName() === chartName)
      .map(({repo}) => repo);
    
    versions = await Promise.all(repos.map(loadVersions))
      .then(flatten)
      .then(this.sortVersions);

    this.versions.set(chartName, versions);
    return versions;
  }

  reset(): void {
    super.reset();
    this.versions.clear();
  }
}

export const helmChartStore = new HelmChartStore();
