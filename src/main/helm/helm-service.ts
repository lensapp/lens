/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Cluster } from "../../common/cluster/cluster";
import logger from "../logger";
import { HelmRepoManager } from "./helm-repo-manager";
import { HelmChartManager } from "./helm-chart-manager";
import { deleteRelease, getHistory, getRelease, getValues, installChart, listReleases, rollback, upgradeRelease } from "./helm-release-manager";

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
    const repositories = await HelmRepoManager.getInstance().repositories();

    return Object.fromEntries(
      await Promise.all(repositories.map(async repo => [repo.name, await HelmChartManager.forRepo(repo).charts()])),
    );
  }

  public async getChart(repoName: string, chartName: string, version = "") {
    const repo = await HelmRepoManager.getInstance().repo(repoName);
    const chartManager = HelmChartManager.forRepo(repo);

    return {
      readme: await chartManager.getReadme(chartName, version),
      versions: await chartManager.chartVersions(chartName),
    };
  }

  public async getChartValues(repoName: string, chartName: string, version = "") {
    const repo = await HelmRepoManager.getInstance().repo(repoName);

    return HelmChartManager.forRepo(repo).getValues(chartName, version);
  }

  public async listReleases(cluster: Cluster, namespace: string = null) {
    const proxyKubeconfig = await cluster.getProxyKubeconfigPath();

    logger.debug("list releases");

    return listReleases(proxyKubeconfig, namespace);
  }

  public async getRelease(cluster: Cluster, releaseName: string, namespace: string) {
    const kubeconfigPath = await cluster.getProxyKubeconfigPath();
    const kubectl = await cluster.ensureKubectl();
    const kubectlPath = await kubectl.getPath();

    logger.debug("Fetch release");

    return getRelease(releaseName, namespace, kubeconfigPath, kubectlPath);
  }

  public async getReleaseValues(releaseName: string, { cluster, namespace, all }: GetReleaseValuesArgs) {
    const pathToKubeconfig = await cluster.getProxyKubeconfigPath();

    logger.debug("Fetch release values");

    return getValues(releaseName, { namespace, all, kubeconfigPath: pathToKubeconfig });
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
    const proxyKubeconfig = await cluster.getProxyKubeconfigPath();
    const kubectl = await cluster.ensureKubectl();
    const kubectlPath = await kubectl.getPath();

    logger.debug("Upgrade release");

    return upgradeRelease(releaseName, data.chart, data.values, namespace, data.version, proxyKubeconfig, kubectlPath);
  }

  public async rollback(cluster: Cluster, releaseName: string, namespace: string, revision: number) {
    const proxyKubeconfig = await cluster.getProxyKubeconfigPath();

    logger.debug("Rollback release");
    const output = rollback(releaseName, namespace, revision, proxyKubeconfig);

    return { message: output };
  }
}

export const helmService = new HelmService();
