import jsYaml from "js-yaml";
import { compile } from "path-to-regexp";
import { autobind, formatDuration } from "../../utils";
import capitalize from "lodash/capitalize";
import { apiBase } from "../index";
import { helmChartStore } from "../../components/+apps-helm-charts/helm-chart.store";
import { ItemObject } from "../../item.store";
import { KubeObject } from "../kube-object";

interface IReleasePayload {
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

interface IReleaseRawDetails extends IReleasePayload {
  resources: string;
}

export interface IReleaseDetails extends IReleasePayload {
  resources: KubeObject[];
}

export interface IReleaseCreatePayload {
  name?: string;
  repo: string;
  chart: string;
  namespace: string;
  version: string;
  values: string;
}

export interface IReleaseUpdatePayload {
  repo: string;
  chart: string;
  version: string;
  values: string;
}

export interface IReleaseUpdateDetails {
  log: string;
  release: IReleaseDetails;
}

export interface IReleaseRevision {
  revision: number;
  updated: string;
  status: string;
  chart: string;
  description: string;
}

const endpoint = compile(`/v2/releases/:namespace?/:name?`) as (
  params?: {
    namespace?: string;
    name?: string;
  }
) => string;

export const helmReleasesApi = {
  list(namespace?: string) {
    return apiBase
      .get<HelmRelease[]>(endpoint({ namespace }))
      .then(releases => releases.map(HelmRelease.create));
  },

  get(name: string, namespace: string) {
    const path = endpoint({ name, namespace });
    return apiBase.get<IReleaseRawDetails>(path).then(details => {
      const items: KubeObject[] = JSON.parse(details.resources).items;
      const resources = items.map(item => KubeObject.create(item));
      return {
        ...details,
        resources
      }
    });
  },

  create(payload: IReleaseCreatePayload): Promise<IReleaseUpdateDetails> {
    const { repo, ...data } = payload;
    data.chart = `${repo}/${data.chart}`;
    data.values = jsYaml.safeLoad(data.values);
    return apiBase.post(endpoint(), { data });
  },

  update(name: string, namespace: string, payload: IReleaseUpdatePayload): Promise<IReleaseUpdateDetails> {
    const { repo, ...data } = payload;
    data.chart = `${repo}/${data.chart}`;
    data.values = jsYaml.safeLoad(data.values);
    return apiBase.put(endpoint({ name, namespace }), { data });
  },

  async delete(name: string, namespace: string) {
    const path = endpoint({ name, namespace });
    return apiBase.del(path);
  },

  getValues(name: string, namespace: string) {
    const path = endpoint({ name, namespace }) + "/values";
    return apiBase.get<string>(path);
  },

  getHistory(name: string, namespace: string): Promise<IReleaseRevision[]> {
    const path = endpoint({ name, namespace }) + "/history";
    return apiBase.get(path);
  },

  rollback(name: string, namespace: string, revision: number) {
    const path = endpoint({ name, namespace }) + "/rollback";
    return apiBase.put(path, {
      data: {
        revision: revision
      }
    });
  }
};

@autobind()
export class HelmRelease implements ItemObject {
  constructor(data: any) {
    Object.assign(this, data);
  }

  static create(data: any) {
    return new HelmRelease(data);
  }

  appVersion: string
  name: string
  namespace: string
  chart: string
  status: string
  updated: string
  revision: string

  getId() {
    return this.namespace + this.name;
  }

  getName() {
    return this.name;
  }

  getNs() {
    return this.namespace;
  }

  getChart(withVersion = false) {
    let chart = this.chart
    if(!withVersion && this.getVersion() != "" ) {
      const search = new RegExp(`-${this.getVersion()}`)
      chart = chart.replace(search, "");
    }
    return chart
  }

  getRevision() {
    return parseInt(this.revision, 10);
  }

  getStatus() {
    return capitalize(this.status);
  }

  getVersion() {
    const versions = this.chart.match(/(v?\d+)[^-].*$/)
    if (versions) {
      return versions[0]
    }
    else {
      return ""
    }
  }

  getUpdated(humanize = true, compact = true) {
    const now = new Date().getTime();
    const updated = this.updated.replace(/\s\w*$/, "");  // 2019-11-26 10:58:09 +0300 MSK -> 2019-11-26 10:58:09 +0300 to pass into Date()
    const updatedDate = new Date(updated).getTime();
    const diff = now - updatedDate;
    if (humanize) {
      return formatDuration(diff, compact);
    }
    return diff;
  }

  // Helm does not store from what repository the release is installed,
  // so we have to try to guess it by searching charts
  async getRepo() {
    const chartName = this.getChart();
    const version = this.getVersion();
    const versions = await helmChartStore.getVersions(chartName);
    const chartVersion = versions.find(chartVersion => chartVersion.version === version);
    return chartVersion ? chartVersion.repo : "";
  }
}
