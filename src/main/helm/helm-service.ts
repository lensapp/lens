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

import semver, { SemVer } from "semver";
import type { Cluster } from "../cluster";
import logger from "../logger";
import { HelmRepoManager } from "./helm-repo-manager";
import { HelmChartManager } from "./helm-chart-manager";
import type { HelmChart, HelmChartList, RepoHelmChartList } from "../../renderer/api/endpoints/helm-charts.api";
import { deleteRelease, getHistory, getRelease, getValues, installChart, listReleases, rollback, upgradeRelease } from "./helm-release-manager";
import { iter, sortCompareChartVersions } from "../../common/utils";

interface GetReleaseValuesArgs {
  cluster: Cluster;
  namespace: string;
  all: boolean;
}

class HelmService {
  public async installChart(cluster: Cluster, data: { chart: string; values: {}; name: string; namespace: string; version: string }) {
    const proxyKubeconfig = await cluster.getProxyKubeconfigPath();

    return installChart(data.chart, data.values, data.name, data.namespace, data.version, proxyKubeconfig);
  }

  public async listCharts() {
    const charts: HelmChartList = {};
    const repositories = await HelmRepoManager.getInstance().repositories();

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
    const repos = await HelmRepoManager.getInstance().repositories();
    const repo = repos.find(repo => repo.name === repoName);
    const chartManager = new HelmChartManager(repo);
    const chart = await chartManager.chart(chartName);

    result.readme = await chartManager.getReadme(chartName, version);
    result.versions = chart;

    return result;
  }

  public async getChartValues(repoName: string, chartName: string, version = "") {
    const repos = await HelmRepoManager.getInstance().repositories();
    const repo = repos.find(repo => repo.name === repoName);
    const chartManager = new HelmChartManager(repo);

    return chartManager.getValues(chartName, version);
  }

  public async listReleases(cluster: Cluster, namespace: string = null) {
    const proxyKubeconfig = await cluster.getProxyKubeconfigPath();

    return listReleases(proxyKubeconfig, namespace);
  }

  public async getRelease(cluster: Cluster, releaseName: string, namespace: string) {
    logger.debug("Fetch release");

    return getRelease(releaseName, namespace, cluster);
  }

  public async getReleaseValues(releaseName: string, { cluster, namespace, all }: GetReleaseValuesArgs) {
    const pathToKubeconfig = await cluster.getProxyKubeconfigPath();

    logger.debug("Fetch release values");

    return getValues(releaseName, { namespace, all, pathToKubeconfig });
  }

  public async getReleaseHistory(cluster: Cluster, releaseName: string, namespace: string) {
    const proxyKubeconfig = await cluster.getProxyKubeconfigPath();

    logger.debug("Fetch release history");

    return getHistory(releaseName, namespace, proxyKubeconfig);
  }

  public async deleteRelease(cluster: Cluster, releaseName: string, namespace: string) {
    const proxyKubeconfig = await cluster.getProxyKubeconfigPath();

    logger.debug("Delete release");

    return deleteRelease(releaseName, namespace, proxyKubeconfig);
  }

  public async updateRelease(cluster: Cluster, releaseName: string, namespace: string, data: { chart: string; values: {}; version: string }) {
    logger.debug("Upgrade release");

    return upgradeRelease(releaseName, data.chart, data.values, namespace, data.version, cluster);
  }

  public async rollback(cluster: Cluster, releaseName: string, namespace: string, revision: number) {
    const proxyKubeconfig = await cluster.getProxyKubeconfigPath();

    logger.debug("Rollback release");
    const output = rollback(releaseName, namespace, revision, proxyKubeconfig);

    return { message: output };
  }

  private excludeDeprecatedChartGroups(chartGroups: RepoHelmChartList) {
    return Object.fromEntries(
      iter.filterMap(
        Object.entries(chartGroups),
        ([name, charts]) => {
          for (const chart of charts) {
            if (chart.deprecated) {
              // ignore chart group if any chart is deprecated
              return undefined;
            }
          }

          return [name, charts];
        }
      )
    );
  }

  private sortCharts(charts: HelmChart[]) {
    interface ExtendedHelmChart extends HelmChart {
      __version: SemVer;
    }

    const chartsWithVersion = Array.from(
      iter.map(
        charts,
        (chart => {
          const __version = semver.coerce(chart.version, { includePrerelease: true, loose: true });

          if (!__version) {
            logger.error(`[HELM-SERVICE]: Version from helm chart is not loosely coercable to semver.`, { name: chart.name, version: chart.version, repo: chart.repo });
          }

          (chart as ExtendedHelmChart).__version = __version;

          return chart as ExtendedHelmChart;
        })
      ),
    );

    return chartsWithVersion
      .sort(sortCompareChartVersions)
      .map(chart => (delete chart.__version, chart as HelmChart));
  }

  private sortChartsByVersion(chartGroups: RepoHelmChartList) {
    return Object.fromEntries(
      Object.entries(chartGroups)
        .map(([name, charts]) => [name, this.sortCharts(charts)])
    );
  }
}

export const helmService = new HelmService();
