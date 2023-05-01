/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import autoBind from "auto-bind";
import { z } from "zod";

export interface RawHelmChart {
  apiVersion: string;
  name: string;
  version: string;
  repo: string;
  created: string;
  digest?: string;
  kubeVersion?: string;
  description?: string;
  home?: string;
  engine?: string;
  icon?: string;
  appVersion?: string;
  type?: string;
  tillerVersion?: string;
  deprecated?: boolean;
  keywords?: string[];
  sources?: string[];
  urls?: string[];
  maintainers?: HelmChartMaintainer[];
  dependencies?: RawHelmChartDependency[];
  annotations?: Record<string, string>;
}

const helmChartMaintainerSchema = z.object({
  name: z.string(),
  email: z.string(),
  url: z.string().optional(),
});

const helmChartDependencySchema = z.object({
  name: z.string(),
  repository: z.string(),
  condition: z.string().optional(),
  version: z.string(),
  tags: z.array(z.string()).default(() => []),
});

const helmChartValidator = z.object({
  apiVersion: z.string(),
  name: z.string(),
  version: z.string(),
  repo: z.string(),
  created: z.string(),
  digest: z.string().optional(),
  kubeVersion: z.string()
    .optional(),
  description: z.string()
    .default(""),
  home: z.string()
    .optional(),
  engine: z.string()
    .optional(),
  icon: z.string()
    .optional(),
  appVersion: z.string()
    .optional(),
  tillerVersion: z.string()
    .optional(),
  type: z.string()
    .optional(),
  deprecated: z.boolean()
    .default(false),
  keywords: z.array(z.string()).default(() => ([])),
  sources: z.array(z.string()).default(() => ([])),
  urls: z.array(z.string()).default(() => ([])),
  maintainers: z.array(helmChartMaintainerSchema).default(() => ([])),
  dependencies: z.array(helmChartDependencySchema).default(() => ([])),
  annotations: z.record(z.string()).default(() => ({})),
});

export interface HelmChartCreateOpts {
  onError?: "throw" | "log";
}

export interface HelmChartMaintainer {
  name: string;
  email: string;
  url?: string;
}

export interface RawHelmChartDependency {
  name: string;
  repository: string;
  condition?: string;
  version: string;
  tags?: string[];
}

export type HelmChartDependency = Required<Omit<RawHelmChartDependency, "condition">>
  & Pick<RawHelmChartDependency, "condition">;

export interface HelmChartData {
  apiVersion: string;
  name: string;
  version: string;
  repo: string;
  created: string;
  description: string;
  keywords: string[];
  sources: string[];
  urls: string[];
  annotations: Record<string, string>;
  dependencies: HelmChartDependency[];
  maintainers: HelmChartMaintainer[];
  deprecated: boolean;
  kubeVersion?: string;
  digest?: string;
  home?: string;
  engine?: string;
  icon?: string;
  appVersion?: string;
  type?: string;
  tillerVersion?: string;
}

export class HelmChart implements HelmChartData {
  apiVersion: string;
  name: string;
  version: string;
  repo: string;
  created: string;
  description: string;
  keywords: string[];
  sources: string[];
  urls: string[];
  annotations: Record<string, string>;
  dependencies: HelmChartDependency[];
  maintainers: HelmChartMaintainer[];
  deprecated: boolean;
  kubeVersion?: string;
  digest?: string;
  home?: string;
  engine?: string;
  icon?: string;
  appVersion?: string;
  type?: string;
  tillerVersion?: string;

  private constructor(value: HelmChart | HelmChartData) {
    this.apiVersion = value.apiVersion;
    this.name = value.name;
    this.version = value.version;
    this.repo = value.repo;
    this.kubeVersion = value.kubeVersion;
    this.created = value.created;
    this.description = value.description;
    this.digest = value.digest;
    this.keywords = value.keywords;
    this.home = value.home;
    this.sources = value.sources;
    this.maintainers = value.maintainers;
    this.engine = value.engine;
    this.icon = value.icon;
    this.apiVersion = value.apiVersion;
    this.deprecated = value.deprecated;
    this.tillerVersion = value.tillerVersion;
    this.annotations = value.annotations;
    this.urls = value.urls;
    this.dependencies = value.dependencies;
    this.type = value.type;

    autoBind(this);
  }

  static create(data: RawHelmChart): HelmChart;
  static create(data: RawHelmChart, opts?: HelmChartCreateOpts): HelmChart | undefined;
  static create(data: RawHelmChart, { onError = "throw" }: HelmChartCreateOpts = {}): HelmChart | undefined {
    const result = helmChartValidator.safeParse(data);

    if (result.success) {
      return new HelmChart(result.data);
    }

    if (onError === "throw") {
      throw result.error;
    }

    console.warn("[HELM-CHART]: failed to validate data", data, result.error);

    return undefined;
  }

  getId(): string {
    const digestPart = this.digest
      ? `+${this.digest}`
      : "";
    const version = this.getAppVersion();
    const versionId = version
      ? `@${version}`
      : "";

    return `${this.repo}:${this.apiVersion}/${this.name}${versionId}${digestPart}`;
  }

  getName(): string {
    return this.name;
  }

  getFullName(separator = "/"): string {
    return [this.getRepository(), this.getName()].join(separator);
  }

  getDescription(): string {
    return this.description;
  }

  getIcon(): string | undefined {
    return this.icon;
  }

  getHome(): string | undefined {
    return this.home;
  }

  getMaintainers(): HelmChartMaintainer[] {
    return this.maintainers;
  }

  getVersion(): string {
    return this.version;
  }

  getRepository(): string {
    return this.repo;
  }

  getAppVersion(): string | undefined {
    return this.appVersion;
  }

  getKeywords(): string[] {
    return this.keywords;
  }
}
