import { compile } from "path-to-regexp";
import { apiBase } from "../index";
import * as querystring from "querystring";
import { autobind } from "../../utils";

interface IHelmChartList {
  [repo: string]: {
    [name: string]: HelmChart;
  };
}

export interface IHelmChartDetails {
  readme: string;
  versions: HelmChart[];
}

const endpoint = compile(`/v2/charts/:repo?/:name?`) as (params?: {
  repo?: string;
  name?: string;
}) => string;

export async function list(): Promise<HelmChart[]> {
  const data = await apiBase.get<IHelmChartList>(endpoint());

  return Object
    .values(data)
    .reduce((allCharts, repoCharts) => allCharts.concat(Object.values(repoCharts)), [])
    .map(HelmChart.create);
}

interface GetHelmChartInfoOptions {
  readmeVersion?: string;
}

export interface HelmChartInfo {
  readme: string;
  versions: HelmChart[];
}

export async function get(repo: string, name: string, { readmeVersion }: GetHelmChartInfoOptions = {}): Promise<HelmChartInfo> {
  const path = endpoint({ repo, name });
  const qs = querystring.stringify({ version: readmeVersion });
  const url = `${path}?${qs}`;
  const { readme, versions: rawVersions } = await apiBase.get<IHelmChartDetails>(url);
  const versions = rawVersions.map(HelmChart.create);

  return {
    readme,
    versions,
  };
}

export async function getValues(repo: string, name: string, readmeVersion: string): Promise<string> {
  const path = endpoint({ repo, name });
  const qs = querystring.stringify({ version: readmeVersion });
  const url = `${path}/values?${qs}`;

  return apiBase.get<string>(url);
}

@autobind()
export class HelmChart {
  constructor(data: any) {
    Object.assign(this, data);
  }

  static create(data: any) {
    return new HelmChart(data);
  }

  apiVersion: string;
  name: string;
  version: string;
  repo: string;
  kubeVersion?: string;
  created: string;
  description?: string;
  digest: string;
  keywords?: string[];
  home?: string;
  sources?: string[];
  maintainers?: {
    name: string;
    email: string;
    url: string;
  }[];
  engine?: string;
  icon?: string;
  appVersion?: string;
  deprecated?: boolean;
  tillerVersion?: string;

  getId() {
    return `${this.apiVersion}/${this.name}@${this.getAppVersion()}`;
  }

  getName() {
    return this.name;
  }

  getFullName(splitter = "/") {
    return [this.getRepository(), this.getName()].join(splitter);
  }

  getDescription() {
    return this.description;
  }

  getIcon() {
    return this.icon;
  }

  getHome() {
    return this.home;
  }

  getMaintainers() {
    return this.maintainers || [];
  }

  getVersion() {
    return this.version;
  }

  getRepository() {
    return this.repo;
  }

  getAppVersion() {
    return this.appVersion || "";
  }

  getKeywords() {
    return this.keywords || [];
  }
}
