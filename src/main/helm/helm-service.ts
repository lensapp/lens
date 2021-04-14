import semver from "semver";
import { Cluster } from "../cluster";
import logger from "../logger";
import { repoManager } from "./helm-repo-manager";
import { HelmChartManager } from "./helm-chart-manager";
import { releaseManager } from "./helm-release-manager";
import { HelmChartList, RepoHelmChartList } from "../../renderer/api/endpoints/helm-charts.api";

class HelmService {
  public async installChart(cluster: Cluster, data: { chart: string; values: {}; name: string; namespace: string; version: string }) {
    const proxyKubeconfig = await cluster.getProxyKubeconfigPath();

    if (!proxyKubeconfig) {
      return;
    }

    return await releaseManager.installChart(data.chart, data.values, data.name, data.namespace, data.version, proxyKubeconfig);
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

  public async getChart(repoName?: string, chartName?: string, version?: string | null) {
    const result = {
      readme: "",
      versions: {}
    };
    const repo = await repoManager.repository(repoName);

    if (!repo || !chartName) {
      return void logger.warn("[HELM-SERVICE]: Missing required information on getChart request", { repo, chartName });
    }

    const chartManager = new HelmChartManager(repo);
    const chart = await chartManager.chart(chartName);

    if (!chart) {
      return void logger.warn("[HELM-SERVICE]: Missing required information on getChart request", { chart });
    }

    result.readme = await chartManager.getReadme(chartName, version || "");
    result.versions = chart;

    return result;
  }

  public async getChartValues(repoName?: string, chartName?: string, version?: string | null) {
    const repo = await repoManager.repository(repoName);

    if (!repo || !chartName) {
      return void logger.warn("[HELM-SERVICE]: Missing required information on getChartValues request", { repo, chartName });
    }

    const chartManager = new HelmChartManager(repo);

    return chartManager.getValues(chartName, version || "");
  }

  public async listReleases(cluster: Cluster, namespace?: string) {
    await repoManager.init();
    const proxyKubeconfig = await cluster.getProxyKubeconfigPath();

    if (!proxyKubeconfig) {
      return void logger.warn("[HELM-SERVICE]: Missing required information on listReleases request", { proxyKubeconfig });
    }

    return await releaseManager.listReleases(proxyKubeconfig, namespace);
  }

  public async getRelease(cluster: Cluster, releaseName?: string, namespace?: string) {
    if (!releaseName || !namespace) {
      return void logger.warn("[HELM-SERVICE]: Missing required information on getRelease request", { releaseName, namespace });
    }

    logger.debug("Fetch release");

    return await releaseManager.getRelease(releaseName, namespace, cluster);
  }

  public async getReleaseValues(cluster: Cluster, releaseName?: string, namespace?: string) {
    const proxyKubeconfig = await cluster.getProxyKubeconfigPath();

    if (!proxyKubeconfig || !releaseName || !namespace) {
      return void logger.warn("[HELM-SERVICE]: Missing required information on getReleaseValues request", { proxyKubeconfig, releaseName, namespace });
    }

    logger.debug("Fetch release values");

    return await releaseManager.getValues(releaseName, namespace, proxyKubeconfig);
  }

  public async getReleaseHistory(cluster: Cluster, releaseName?: string, namespace?: string) {
    const proxyKubeconfig = await cluster.getProxyKubeconfigPath();

    if (!proxyKubeconfig || !releaseName || !namespace) {
      return void logger.warn("[HELM-SERVICE]: Missing required information on getReleaseHistory request", { proxyKubeconfig, releaseName, namespace });
    }

    logger.debug("Fetch release history");

    return await releaseManager.getHistory(releaseName, namespace, proxyKubeconfig);
  }

  public async deleteRelease(cluster: Cluster, releaseName?: string, namespace?: string) {
    const proxyKubeconfig = await cluster.getProxyKubeconfigPath();

    if (!proxyKubeconfig || !releaseName || !namespace) {
      return void logger.warn("[HELM-SERVICE]: Missing required information on deleteRelease request", { proxyKubeconfig, releaseName, namespace });
    }

    logger.debug("Delete release");

    return await releaseManager.deleteRelease(releaseName, namespace, proxyKubeconfig);
  }

  public async updateRelease(cluster: Cluster, releaseName?: string, namespace?: string, data?: { chart: string; values: {}; version: string }) {
    if (!releaseName || !namespace || !data) {
      return void logger.warn("[HELM-SERVICE]: Missing required information on updateRelease request", { releaseName, namespace, data });
    }

    logger.debug("Upgrade release");

    return await releaseManager.upgradeRelease(releaseName, data.chart, data.values, namespace, data.version, cluster);
  }

  public async rollback(cluster: Cluster, releaseName?: string, namespace?: string, revision?: number) {
    const proxyKubeconfig = await cluster.getProxyKubeconfigPath();

    if (!proxyKubeconfig || !releaseName || !namespace || !revision) {
      return void logger.warn("[HELM-SERVICE]: Missing required information on rollback request", { proxyKubeconfig, releaseName, namespace, revision });
    }

    logger.debug("Rollback release");
    const output = await releaseManager.rollback(releaseName, namespace, revision, proxyKubeconfig);

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

        if (!firstVersion || !secondVersion) {
          return 0; // consider this case as equal
        }

        return semver.compare(secondVersion, firstVersion);
      });
    }

    return chartGroups;
  }
}

export const helmService = new HelmService();
