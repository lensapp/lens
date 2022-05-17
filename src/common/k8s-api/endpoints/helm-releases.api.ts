/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import yaml from "js-yaml";
import { formatDuration } from "../../utils";
import capitalize from "lodash/capitalize";
import { apiBase } from "../index";
import { helmChartStore } from "../../../renderer/components/+helm-charts/helm-chart.store";
import type { ItemObject } from "../../item.store";
import type { JsonApiData } from "../json-api";
import { buildURLPositional } from "../../utils/buildUrl";
import type { KubeJsonApiData } from "../kube-json-api";

export interface HelmReleaseDetails {
  resources: KubeJsonApiData[];
  name: string;
  namespace: string;
  version: string;
  config: string;  // release values
  manifest: string;
  info: {
    deleted: string;
    description: string;
    first_deployed: string;
    last_deployed: string;
    notes: string;
    status: string;
  };
}

export interface HelmReleaseCreatePayload {
  name?: string;
  repo: string;
  chart: string;
  namespace: string;
  version: string;
  values: string;
}

export interface HelmReleaseUpdatePayload {
  repo: string;
  chart: string;
  version: string;
  values: string;
}

export interface HelmReleaseUpdateDetails {
  log: string;
  release: HelmReleaseDetails;
}

export interface HelmReleaseRevision {
  revision: number;
  updated: string;
  status: string;
  chart: string;
  app_version: string;
  description: string;
}

type EndpointParams = {}
  | { namespace: string }
  | { namespace: string; name: string }
  | { namespace: string; name: string; route: string };

interface EndpointQuery {
  all?: boolean;
}

const endpoint = buildURLPositional<EndpointParams, EndpointQuery>("/v2/releases/:namespace?/:name?/:route?");

export async function listReleases(namespace?: string): Promise<HelmRelease[]> {
  const releases = await apiBase.get<HelmReleaseDto[]>(endpoint({ namespace }));

  return releases.map(toHelmRelease);
}

export async function getRelease(name: string, namespace: string): Promise<HelmReleaseDetails> {
  const path = endpoint({ name, namespace });

  return apiBase.get(path);
}

export async function createRelease(payload: HelmReleaseCreatePayload): Promise<HelmReleaseUpdateDetails> {
  const { repo, chart: rawChart, values: rawValues, ...data } = payload;
  const chart = `${repo}/${rawChart}`;
  const values = yaml.load(rawValues);

  return apiBase.post(endpoint(), {
    data: {
      chart,
      values,
      ...data,
    },
  });
}

export async function updateRelease(name: string, namespace: string, payload: HelmReleaseUpdatePayload): Promise<HelmReleaseUpdateDetails> {
  const { repo, chart: rawChart, values: rawValues, ...data } = payload;
  const chart = `${repo}/${rawChart}`;
  const values = yaml.load(rawValues);

  return apiBase.put(endpoint({ name, namespace }), {
    data: {
      chart,
      values,
      ...data,
    },
  });
}

export async function deleteRelease(name: string, namespace: string): Promise<JsonApiData> {
  const path = endpoint({ name, namespace });

  return apiBase.del(path);
}

export async function getReleaseValues(name: string, namespace: string, all?: boolean): Promise<string> {
  const route = "values";
  const path = endpoint({ name, namespace, route }, { all });

  return apiBase.get<string>(path);
}

export async function getReleaseHistory(name: string, namespace: string): Promise<HelmReleaseRevision[]> {
  const route = "history";
  const path = endpoint({ name, namespace, route });

  return apiBase.get(path);
}

export async function rollbackRelease(name: string, namespace: string, revision: number): Promise<JsonApiData> {
  const route = "rollback";
  const path = endpoint({ name, namespace, route });
  const data = { revision };

  return apiBase.put(path, { data });
}

interface HelmReleaseDto {
  appVersion: string;
  name: string;
  namespace: string;
  chart: string;
  status: string;
  updated: string;
  revision: string;
}

export interface HelmRelease extends HelmReleaseDto, ItemObject {
  getNs: () => string;
  getChart: (withVersion?: boolean) => string;
  getRevision: () => number;
  getStatus: () => string;
  getVersion: () => string;
  getUpdated: (humanize?: boolean, compact?: boolean) => string | number;
  getRepo: () => Promise<string>;
}

const toHelmRelease = (release: HelmReleaseDto) : HelmRelease => ({
  ...release,

  getId() {
    return this.namespace + this.name;
  },

  getName() {
    return this.name;
  },

  getNs() {
    return this.namespace;
  },

  getChart(withVersion = false) {
    let chart = this.chart;

    if (!withVersion && this.getVersion() != "") {
      const search = new RegExp(`-${this.getVersion()}`);

      chart = chart.replace(search, "");
    }

    return chart;
  },

  getRevision() {
    return parseInt(this.revision, 10);
  },

  getStatus() {
    return capitalize(this.status);
  },

  getVersion() {
    const versions = this.chart.match(/(?<=-)(v?\d+)[^-].*$/);

    return versions?.[0] ?? "";
  },

  getUpdated(humanize = true, compact = true) {
    const updated = this.updated.replace(/\s\w*$/, ""); // 2019-11-26 10:58:09 +0300 MSK -> 2019-11-26 10:58:09 +0300 to pass into Date()
    const updatedDate = new Date(updated).getTime();
    const diff = Date.now() - updatedDate;

    if (humanize) {
      return formatDuration(diff, compact);
    }

    return diff;
  },

  // Helm does not store from what repository the release is installed,
  // so we have to try to guess it by searching charts
  async getRepo() {
    const chartName = this.getChart();
    const version = this.getVersion();
    const versions = await helmChartStore.getVersions(chartName);
    const chartVersion = versions.find(
      (chartVersion) => chartVersion.version === version,
    );

    return chartVersion ? chartVersion.repo : "";
  },
});
