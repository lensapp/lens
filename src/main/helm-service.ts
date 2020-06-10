import { Cluster } from "./cluster";
import logger from "./logger";
import { repoManager } from "./helm-repo-manager";
import { HelmChartManager } from "./helm-chart-manager";
import { releaseManager } from "./helm-release-manager";

class HelmService {
  public async installChart(cluster: Cluster, data: {chart: string; values: {}; name: string; namespace: string; version: string}) {
    const installResult = await releaseManager.installChart(data.chart, data.values, data.name, data.namespace, data.version, cluster.kubeconfigPath())
    return installResult
  }

  public async listCharts() {
    const charts: any = {}
    await repoManager.init()
    const repositories = await repoManager.repositories()
    for (const repo of repositories) {
      charts[repo.name] = {}
      const manager = new HelmChartManager(repo)
      let entries = await manager.charts()
      entries = this.excludeDeprecated(entries)
      for(const key in entries) {
        entries[key] = entries[key][0]
      }
      charts[repo.name] = entries
    }
    return charts
  }

  public async getChart(repoName: string, chartName: string, version = "") {
    const result = {
      readme: "",
      versions: {}
    }
    const repo = await repoManager.repository(repoName)
    const chartManager = new HelmChartManager(repo)
    const chart = await chartManager.chart(chartName)
    result.readme = await chartManager.getReadme(chartName, version)
    result.versions = chart
    return result
  }

  public async getChartValues(repoName: string, chartName: string, version = "") {
    const repo = await repoManager.repository(repoName)
    const chartManager = new HelmChartManager(repo)
    return chartManager.getValues(chartName, version)
  }

  public async listReleases(cluster: Cluster, namespace: string = null) {
    await repoManager.init()
    const releases = await releaseManager.listReleases(cluster.kubeconfigPath(), namespace)
    return releases
  }

  public async getRelease(cluster: Cluster,  releaseName: string, namespace: string) {
    logger.debug("Fetch release")
    const release = await releaseManager.getRelease(releaseName, namespace, cluster)
    return release
  }

  public async getReleaseValues(cluster: Cluster, releaseName: string, namespace: string) {
    logger.debug("Fetch release values")
    const values = await releaseManager.getValues(releaseName, namespace, cluster.kubeconfigPath())
    return values
  }

  public async getReleaseHistory(cluster: Cluster, releaseName: string, namespace: string) {
    logger.debug("Fetch release history")
    const history = await releaseManager.getHistory(releaseName, namespace, cluster.kubeconfigPath())
    return(history)
  }

  public async deleteRelease(cluster: Cluster, releaseName: string, namespace: string) {
    logger.debug("Delete release")
    const release = await releaseManager.deleteRelease(releaseName, namespace, cluster.kubeconfigPath())
    return release
  }

  public async updateRelease(cluster: Cluster, releaseName: string, namespace: string, data: {chart: string; values: {}; version: string}) {
    logger.debug("Upgrade release")
    const release = await releaseManager.upgradeRelease(releaseName, data.chart, data.values, namespace, data.version, cluster)
    return release
  }

  public async rollback(cluster: Cluster, releaseName: string, namespace: string, revision: number) {
    logger.debug("Rollback release")
    const output = await releaseManager.rollback(releaseName, namespace, revision, cluster.kubeconfigPath())
    return({ message: output })
  }

  protected excludeDeprecated(entries: any) {
    for(const key in entries) {
      entries[key] = entries[key].filter((entry: any) => {
        if(Array.isArray(entry)) {
          return entry[0]['deprecated'] != true
        }
        return entry["deprecated"] != true
      })
    }
    return entries
  }

}

export const helmService = new HelmService()
