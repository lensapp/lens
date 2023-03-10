/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { array } from "@k8slens/utilities";
import autoBind from "auto-bind";
import Joi from "joi";

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

const helmChartMaintainerValidator = Joi.object<HelmChartMaintainer>({
  name: Joi
    .string()
    .required(),
  email: Joi
    .string()
    .required(),
  url: Joi
    .string()
    .optional(),
});

const helmChartDependencyValidator = Joi.object<HelmChartDependency, true, RawHelmChartDependency>({
  name: Joi
    .string()
    .required(),
  repository: Joi
    .string()
    .required(),
  condition: Joi
    .string()
    .optional(),
  version: Joi
    .string()
    .required(),
  tags: Joi
    .array()
    .items(Joi.string())
    .default(() => ([])),
});

const helmChartValidator = Joi.object<HelmChart, true, RawHelmChart>({
  apiVersion: Joi
    .string()
    .required(),
  name: Joi
    .string()
    .required(),
  version: Joi
    .string()
    .required(),
  repo: Joi
    .string()
    .required(),
  created: Joi
    .string()
    .required(),
  digest: Joi
    .string()
    .optional(),
  kubeVersion: Joi
    .string()
    .optional(),
  description: Joi
    .string()
    .default(""),
  home: Joi
    .string()
    .optional(),
  engine: Joi
    .string()
    .optional(),
  icon: Joi
    .string()
    .optional(),
  appVersion: Joi
    .string()
    .optional(),
  tillerVersion: Joi
    .string()
    .optional(),
  type: Joi
    .string()
    .optional(),
  deprecated: Joi
    .boolean()
    .default(false),
  keywords: Joi
    .array()
    .items(Joi.string())
    .options({
      stripUnknown: {
        arrays: true,
      },
    })
    .default(() => ([])),
  sources: Joi
    .array()
    .items(Joi.string())
    .options({
      stripUnknown: {
        arrays: true,
      },
    })
    .default(() => ([])),
  urls: Joi
    .array()
    .items(Joi.string())
    .options({
      stripUnknown: {
        arrays: true,
      },
    })
    .default(() => ([])),
  maintainers: Joi
    .array()
    .items(helmChartMaintainerValidator)
    .options({
      stripUnknown: {
        arrays: true,
      },
    })
    .default(() => ([])),
  dependencies: Joi
    .array()
    .items(helmChartDependencyValidator)
    .options({
      stripUnknown: {
        arrays: true,
      },
    })
    .default(() => ([])),
  annotations: Joi
    .object({})
    .pattern(/.*/, Joi.string())
    .default(() => ({})),
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
    const result = helmChartValidator.validate(data, {
      abortEarly: false,
    });

    if (!result.error) {
      return new HelmChart(result.value);
    }

    const [actualErrors, unknownDetails] = array.bifurcate(result.error.details, ({ type }) => type === "object.unknown");

    if (unknownDetails.length > 0) {
      console.warn("HelmChart data has unexpected fields", { original: data, unknownFields: unknownDetails.flatMap(d => d.path) });
    }

    if (actualErrors.length === 0) {
      return new HelmChart(result.value as unknown as HelmChartData);
    }

    const validationError = new Joi.ValidationError(actualErrors.map(er => er.message).join(". "), actualErrors, result.error._original);

    if (onError === "throw") {
      throw validationError;
    }

    console.warn("[HELM-CHART]: failed to validate data", data, validationError);

    return undefined;
  }

  getId(): string {
    const digestPart = this.digest
      ? `+${this.digest}`
      : "";

    return `${this.repo}:${this.apiVersion}/${this.name}@${this.getAppVersion()}${digestPart}`;
  }

  getName(): string {
    return this.name;
  }

  getFullName(seperator = "/"): string {
    return [this.getRepository(), this.getName()].join(seperator);
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
