import { Cluster } from "./cluster";
import logger from "./logger";
import { repoManager } from "./helm-repo-manager";
import { HelmChartManager } from "./helm-chart-manager";
import * as releaseManager from "./helm-release-manager";

function excludeDeprecated(entries: any): any {
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

export interface InstallChartOptions {
  chart: string; 
  values: any; 
  name: string; 
  namespace: string; 
  version: string;
}

export async function installChart(cluster: Cluster, options: InstallChartOptions): Promise<releaseManager.HelmResponse> {
  return releaseManager.installChart(options.chart, options.values, options.name, options.namespace, options.version, cluster.kubeconfigPath());
}

export async function listCharts(): Promise<Record<string, any>> {
  const charts: Record<string, any> = {};
  await repoManager.init();
  const repositories = await repoManager.repositories();
  for (const repo of repositories) {
    charts[repo.name] = {};
    const manager = new HelmChartManager(repo);
    let entries = await manager.charts();
    entries = excludeDeprecated(entries);
    for(const key in entries) {
      entries[key] = entries[key][0];
    }
    charts[repo.name] = entries;
  }
  return charts;
}

export interface Chart {
  readme: string;
  versions: any;
}

export async function getChart(repoName: string, chartName: string, version = ""): Promise<Chart> {
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

export async function getChartValues(repoName: string, chartName: string, version = ""): Promise<string> {
  const repo = await repoManager.repository(repoName);
  const chartManager = new HelmChartManager(repo);
  return chartManager.getValues(chartName, version);
}

export async function listReleases(cluster: Cluster, namespace: string = null): Promise<any> {
  await repoManager.init();
  return releaseManager.listReleases(cluster.kubeconfigPath(), namespace);
}

export async function getRelease(cluster: Cluster, releaseName: string, namespace: string): Promise<any> {
  logger.debug("Fetch release");
  return releaseManager.getRelease(releaseName, namespace, cluster);
}

export async function getReleaseValues(cluster: Cluster, releaseName: string, namespace: string): Promise<any> {
  logger.debug("Fetch release values");
  return releaseManager.getValues(releaseName, namespace, cluster.kubeconfigPath());
}

export async function getReleaseHistory(cluster: Cluster, releaseName: string, namespace: string): Promise<string> {
  logger.debug("Fetch release history");
  return releaseManager.getHistory(releaseName, namespace, cluster.kubeconfigPath());
}

export async function deleteRelease(cluster: Cluster, releaseName: string, namespace: string): Promise<string> {
  logger.debug("Delete release");
  return releaseManager.deleteRelease(releaseName, namespace, cluster.kubeconfigPath());
}

export async function updateRelease(cluster: Cluster, releaseName: string, namespace: string, data: { chart: string; values: {}; version: string }): Promise<releaseManager.HelmResponse> {
  logger.debug("Upgrade release");
  return releaseManager.upgradeRelease(releaseName, data.chart, data.values, namespace, data.version, cluster);
}

export async function rollback(cluster: Cluster, releaseName: string, namespace: string, revision: number): Promise<{message: string}> {
  logger.debug("Rollback release");
  const output = await releaseManager.rollback(releaseName, namespace, revision, cluster.kubeconfigPath());
  return({ message: output });
}
