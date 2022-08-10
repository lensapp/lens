/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import fs from "fs";
import * as yaml from "js-yaml";
import type { RepoHelmChartList } from "../../common/k8s-api/endpoints/helm-charts.api";
import { iter, put, sortCharts } from "../../common/utils";
import { execHelm } from "./exec";
import type { SetRequired } from "type-fest";
import { assert } from "console";
import type { HelmRepo } from "../../common/helm/helm-repo";
import type { HelmChartManagerCache } from "./helm-chart-manager-cache.injectable";
import type { Logger } from "../../common/logger";

export interface HelmCacheFile {
  apiVersion: string;
  entries: RepoHelmChartList;
}

interface Dependencies {
  cache: HelmChartManagerCache;
  logger: Logger;
}

export class HelmChartManager {
  protected readonly repo: SetRequired<HelmRepo, "cacheFilePath">;

  constructor(repo: HelmRepo, private dependencies: Dependencies) {
    assert(repo.cacheFilePath, "CacheFilePath must be provided on the helm repo");

    this.repo = repo as SetRequired<HelmRepo, "cacheFilePath">;
  }

  public async chartVersions(name: string) {
    const charts = await this.charts();

    return charts[name];
  }

  public async charts(): Promise<RepoHelmChartList> {
    try {
      return await this.cachedYaml();
    } catch(error) {
      this.dependencies.logger.error("HELM-CHART-MANAGER]: failed to list charts", { error });

      return {};
    }
  }

  private async executeCommand(args: string[], name: string, version?: string) {
    args.push(`${this.repo.name}/${name}`);

    if (version) {
      args.push("--version", version);
    }

    return execHelm(args);
  }

  public async getReadme(name: string, version?: string) {
    return this.executeCommand(["show", "readme"], name, version);
  }

  public async getValues(name: string, version?: string) {
    return this.executeCommand(["show", "values"], name, version);
  }

  protected async updateYamlCache() {
    const cacheFile = await fs.promises.readFile(this.repo.cacheFilePath, "utf-8");
    const cacheFileStats = await fs.promises.stat(this.repo.cacheFilePath);
    const data = yaml.load(cacheFile) as string | number | HelmCacheFile;

    if (!data || typeof data !== "object" || typeof data.entries !== "object") {
      throw Object.assign(new TypeError("Helm Cache file does not parse correctly"), { file: this.repo.cacheFilePath, data });
    }

    const normalized = normalizeHelmCharts(this.repo.name, data.entries);

    return put(
      this.dependencies.cache,
      this.repo.name,
      {
        data: JSON.stringify(normalized),
        mtimeMs: cacheFileStats.mtimeMs,
      },
    );
  }

  protected async cachedYaml(): Promise<RepoHelmChartList> {
    let cacheEntry = this.dependencies.cache.get(this.repo.name);

    if (!cacheEntry) {
      cacheEntry = await this.updateYamlCache();
    } else {
      const newStats = await fs.promises.stat(this.repo.cacheFilePath);

      if (cacheEntry.mtimeMs < newStats.mtimeMs) {
        cacheEntry = await this.updateYamlCache();
      }
    }

    return JSON.parse(cacheEntry.data);
  }
}

/**
 * Do some initial preprocessing on the data, so as to avoid needing to do it later
 * 1. Set the repo name
 * 2. Normalize the created date
 * 3. Filter out charts that only have deprecated entries
 */
function normalizeHelmCharts(repoName: string, entries: RepoHelmChartList): RepoHelmChartList {
  return Object.fromEntries(
    iter.filter(
      iter.map(
        Object.entries(entries),
        ([name, charts]) => [
          name,
          sortCharts(
            charts.map(chart => ({
              ...chart,
              created: Date.parse(chart.created).toString(),
              repo: repoName,
            })),
          ),
        ] as const,
      ),
      ([, charts]) => !charts.every(chart => chart.deprecated),
    ),
  );
}
