import semver from "semver";
import { Cluster } from "../cluster";
import logger from "../logger";
import { repoManager } from "./helm-repo-manager";
import { HelmChartManager } from "./helm-chart-manager";
import { releaseManager } from "./helm-release-manager";
import { HelmChartList, RepoHelmChartList } from "../../renderer/api/endpoints/helm-charts.api";

class HelmService {
  public async installChart(cluster: Cluster, data: { chart: string; values: {}; name: string; namespace: string; version: string }) {
    return await releaseManager.installChart(data.chart, data.values, data.name, data.namespace, data.version, cluster.getProxyKubeconfigPath());
  }

  public async listCharts() {
    const charts: HelmChartList = {};

    await repoManager.init();
    const repositories = await repoManager.repositories();

    for (const repo of repositories) {
      charts[repo.name] = {};
      const manager = new HelmChartManager(repo);
      const sortedCharts = this.sortChartsByVersion(await manager.charts());
      const enabledCharts = this.excludeDeprecatedChartGroups(sortedCharts);

      charts[repo.name] = enabledCharts;
    }

    return charts;
  }

  public async getChart(repoName: string, chartName: string, version = "") {
    const result = {
      readme: "",
      versions: {}
    };
    const repo = await repoManager.repository(repoName);
    const chartManager = new HelmChartManager(repo);
    const chart = await chartManager.chart(chartName);

    result.readme = await chartManager.getReadme(chartName, version);
    result.versions = chart;

    return result;
  }

  public async getChartValues(repoName: string, chartName: string, version = "") {
    const repo = await repoManager.repository(repoName);
    const chartManager = new HelmChartManager(repo);

    return chartManager.getValues(chartName, version);
  }

  public async listReleases(cluster: Cluster, namespace: string = null) {
    await repoManager.init();

    return await releaseManager.listReleases(cluster.getProxyKubeconfigPath(), namespace);
  }

  public async getRelease(cluster: Cluster, releaseName: string, namespace: string) {
    logger.debug("Fetch release");

    return await releaseManager.getRelease(releaseName, namespace, cluster);
  }

  public async getReleaseValues(cluster: Cluster, releaseName: string, namespace: string) {
    logger.debug("Fetch release values");

    return await releaseManager.getValues(releaseName, namespace, cluster.getProxyKubeconfigPath());
  }

  public async getReleaseHistory(cluster: Cluster, releaseName: string, namespace: string) {
    logger.debug("Fetch release history");

    return await releaseManager.getHistory(releaseName, namespace, cluster.getProxyKubeconfigPath());
  }

  public async deleteRelease(cluster: Cluster, releaseName: string, namespace: string) {
    logger.debug("Delete release");

    return await releaseManager.deleteRelease(releaseName, namespace, cluster.getProxyKubeconfigPath());
  }

  public async updateRelease(cluster: Cluster, releaseName: string, namespace: string, data: { chart: string; values: {}; version: string }) {
    logger.debug("Upgrade release");

    return await releaseManager.upgradeRelease(releaseName, data.chart, data.values, namespace, data.version, cluster);
  }

  public async rollback(cluster: Cluster, releaseName: string, namespace: string, revision: number) {
    logger.debug("Rollback release");
    const output = await releaseManager.rollback(releaseName, namespace, revision, cluster.getProxyKubeconfigPath());

    return { message: output };
  }

  private excludeDeprecatedChartGroups(chartGroups: RepoHelmChartList) {
    const groups = new Map(Object.entries(chartGroups));

    for (const [chartName, charts] of groups) {
      if (charts[0].deprecated) {
        groups.delete(chartName);
      }
    }

    return Object.fromEntries(groups);
  }

  private sortChartsByVersion(chartGroups: RepoHelmChartList) {
    for (const key in chartGroups) {
      chartGroups[key] = chartGroups[key].sort((first, second) => {
        const firstVersion = semver.coerce(first.version || 0);
        const secondVersion = semver.coerce(second.version || 0);

        return semver.compare(secondVersion, firstVersion);
      });
    }

    return chartGroups;
  }
}

export const helmService = new HelmService();
