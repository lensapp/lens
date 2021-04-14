import { compile } from "path-to-regexp";
import { apiBase } from "../index";
import { stringify } from "querystring";
import { autobind, NotFalsy } from "../../utils";

export interface HelmChartData {
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
}

export type RepoHelmChartList = Record<string, HelmChartData[]>;
export type HelmChartList = Record<string, RepoHelmChartList>;

export interface IHelmChartDetails {
  readme: string;
  versions: HelmChart[];
}

const endpoint = compile(`/v2/charts/:repo?/:name?`) as (params?: {
  repo?: string;
  name?: string;
}) => string;

export const helmChartsApi = {
  async list() {
    const data = await apiBase.get<HelmChartList>(endpoint());

    return Object.values(data)
      .flatMap(chartList => Object.values(chartList)[0])
      .filter(NotFalsy)
      .map(HelmChart.create);
  },

  async get(repo: string, name: string, readmeVersion?: string) {
    const path = endpoint({ repo, name });

    const data = await apiBase
      .get<IHelmChartDetails>(`${path}?${stringify({ version: readmeVersion })}`);
    const versions = data.versions.map(HelmChart.create);
    const readme = data.readme;

    return {
      readme,
      versions,
    };
  },

  getValues(repo: string, name: string, version: string) {
    return apiBase
      .get<string>(`/v2/charts/${repo}/${name}/values?${stringify({ version })}`);
  }
};

@autobind()
export class HelmChart implements HelmChartData {
  constructor(data: HelmChartData) {
    this.apiVersion = data.apiVersion;
    this.name = data.name;
    this.version = data.version;
    this.repo = data.repo;
    this.kubeVersion = data.kubeVersion;
    this.created = data.created;
    this.description = data.description;
    this.digest = data.digest;
    this.keywords = data.keywords;
    this.home = data.home;
    this.sources = data.sources;
    this.maintainers = data.maintainers;
    this.engine = data.engine;
    this.icon = data.icon;
    this.appVersion = data.appVersion;
    this.deprecated = data.deprecated;
    this.tillerVersion = data.tillerVersion;
  }

  static create(data: HelmChartData) {
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
    return `${this.repo}:${this.apiVersion}/${this.name}@${this.getAppVersion()}+${this.digest}`;
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
