import { Cluster } from "../cluster";
import logger from "../logger";
import { repoManager } from "./helm-repo-manager";
import { HelmChartManager } from "./helm-chart-manager";
import { releaseManager } from "./helm-release-manager";

class HelmService {
  public async installChart(cluster: Cluster, data: { chart: string; values: {}; name: string; namespace: string; version: string }) {
    return await releaseManager.installChart(data.chart, data.values, data.name, data.namespace, data.version, cluster.getProxyKubeconfigPath());
  }

  public async listCharts() {
    const charts: any = {};
    await repoManager.init();
    const repositories = await repoManager.repositories();
    for (const repo of repositories) {
      charts[repo.name] = {};
      const manager = new HelmChartManager(repo);
      let entries = await manager.charts();
      entries = this.excludeDeprecated(entries);
      for (const key in entries) {
        entries[key] = entries[key][0];
      }
      charts[repo.name] = entries;
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

  protected excludeDeprecated(entries: any) {
    for (const key in entries) {
      entries[key] = entries[key].filter((entry: any) => {
        if (Array.isArray(entry)) {
          return entry[0]['deprecated'] != true;
        }
        return entry["deprecated"] != true;
      });
    }
    return entries;
  }

}

export const helmService = new HelmService();
