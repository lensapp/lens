/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import * as yaml from "js-yaml";
import { iter, put, sortBySemverVersion } from "@k8slens/utilities";
import type { HelmRepo } from "../../common/helm/helm-repo";
import type { HelmChartManagerCache } from "./helm-chart-manager-cache.injectable";
import type { Logger } from "@k8slens/logger";
import type { RepoHelmChartList } from "../../common/k8s-api/endpoints/helm-charts.api/request-charts.injectable";
import type { ExecHelm } from "./exec-helm/exec-helm.injectable";
import type { ReadFile } from "../../common/fs/read-file.injectable";
import type { Stat } from "../../common/fs/stat.injectable";

export interface HelmCacheFile {
  apiVersion: string;
  entries: RepoHelmChartList;
}

interface Dependencies {
  readonly cache: HelmChartManagerCache;
  readonly logger: Logger;
  execHelm: ExecHelm;
  readFile: ReadFile;
  stat: Stat;
}

export class HelmChartManager {
  constructor(
    private readonly dependencies: Dependencies,
    protected readonly repo: HelmRepo,
  ) {}

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

    return this.dependencies.execHelm(args);
  }

  public async getReadme(name: string, version?: string) {
    return this.executeCommand(["show", "readme"], name, version);
  }

  public async getValues(name: string, version?: string) {
    return this.executeCommand(["show", "values"], name, version);
  }

  protected async updateYamlCache() {
    const cacheFile = await this.dependencies.readFile(this.repo.cacheFilePath);
    const cacheFileStats = await this.dependencies.stat(this.repo.cacheFilePath);
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
      const newStats = await this.dependencies.stat(this.repo.cacheFilePath);

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
          sortBySemverVersion(
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
