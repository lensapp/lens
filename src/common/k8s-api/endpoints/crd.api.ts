/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getLegacyGlobalDiForExtensionApi } from "../../../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import customResourcesRouteInjectable from "../../front-end-routing/routes/cluster/custom-resources/custom-resources/custom-resources-route.injectable";
import { buildURL } from "../../utils/buildUrl";
import type { BaseKubeObjectCondition, KubeObjectScope } from "../kube-object";
import { KubeObject } from "../kube-object";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

interface AdditionalPrinterColumnsCommon {
  name: string;
  type: "integer" | "number" | "string" | "boolean" | "date";
  priority: number;
  description: string;
}

export type AdditionalPrinterColumnsV1 = AdditionalPrinterColumnsCommon & {
  jsonPath: string;
};

type AdditionalPrinterColumnsV1Beta = AdditionalPrinterColumnsCommon & {
  JSONPath: string;
};

export interface CustomResourceDefinitionVersion {
  name: string;
  served: boolean;
  storage: boolean;
  schema?: object; // required in v1 but not present in v1beta
  additionalPrinterColumns?: AdditionalPrinterColumnsV1[];
}

export interface CustomResourceDefinitionNames {
  categories?: string[];
  kind: string;
  listKind?: string;
  plural: string;
  shortNames?: string[];
  singular?: string;
}

export interface CustomResourceConversion {
  strategy?: string;
  webhook?: WebhookConversion;
}

export interface WebhookConversion {
  clientConfig?: WebhookClientConfig[];
  conversionReviewVersions: string[];
}

export interface WebhookClientConfig {
  caBundle?: string;
  url?: string;
  service?: ServiceReference;
}

export interface ServiceReference {
  name: string;
  namespace: string;
  path?: string;
  port?: number;
}

export interface CustomResourceDefinitionSpec {
  group: string;
  /**
   * @deprecated for apiextensions.k8s.io/v1 but used in v1beta1
   */
  version?: string;
  names: CustomResourceDefinitionNames;
  scope: "Namespaced" | "Cluster";
  /**
   * @deprecated for apiextensions.k8s.io/v1 but used in v1beta1
   */
  validation?: object;
  versions?: CustomResourceDefinitionVersion[];
  conversion?: CustomResourceConversion;
  /**
   * @deprecated for apiextensions.k8s.io/v1 but used in v1beta1
   */
  additionalPrinterColumns?: AdditionalPrinterColumnsV1Beta[];
  preserveUnknownFields?: boolean;
}

export interface CustomResourceDefinitionConditionAcceptedNames {
  plural: string;
  singular: string;
  kind: string;
  shortNames: string[];
  listKind: string;
}

export interface CustomResourceDefinitionStatus {
  conditions?: BaseKubeObjectCondition[];
  acceptedNames: CustomResourceDefinitionConditionAcceptedNames;
  storedVersions: string[];
}

export class CustomResourceDefinition extends KubeObject<CustomResourceDefinitionStatus, CustomResourceDefinitionSpec, KubeObjectScope.Cluster> {
  static kind = "CustomResourceDefinition";
  static namespaced = false;
  static apiBase = "/apis/apiextensions.k8s.io/v1/customresourcedefinitions";

  getResourceUrl() {
    const di = getLegacyGlobalDiForExtensionApi();

    const customResourcesRoute = di.inject(customResourcesRouteInjectable);

    return buildURL(customResourcesRoute.path, {
      params: {
        group: this.getGroup(),
        name: this.getPluralName(),
      },
    });
  }

  getResourceApiBase() {
    const { group } = this.spec;

    return `/apis/${group}/${this.getVersion()}/${this.getPluralName()}`;
  }

  getPluralName() {
    return this.getNames().plural;
  }

  getResourceKind() {
    return this.spec.names.kind;
  }

  getResourceTitle() {
    const name = this.getPluralName();

    return name[0].toUpperCase() + name.slice(1);
  }

  getGroup() {
    return this.spec.group;
  }

  getScope() {
    return this.spec.scope;
  }

  getPreferedVersion(): CustomResourceDefinitionVersion {
    const { apiVersion } = this;

    switch (apiVersion) {
      case "apiextensions.k8s.io/v1":
        for (const version of this.spec.versions ?? []) {
          if (version.storage) {
            return version;
          }
        }
        break;

      case "apiextensions.k8s.io/v1beta1": {
        const { additionalPrinterColumns: apc } = this.spec;
        const additionalPrinterColumns = apc?.map(({ JSONPath, ...apc }) => ({ ...apc, jsonPath: JSONPath }));

        return {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          name: this.spec.version!,
          served: true,
          storage: true,
          schema: this.spec.validation,
          additionalPrinterColumns,
        };
      }
    }

    throw new Error(`Unknown apiVersion=${apiVersion}: Failed to find a version for CustomResourceDefinition ${this.metadata.name}`);
  }

  getVersion() {
    return this.getPreferedVersion().name;
  }

  isNamespaced() {
    return this.getScope() === "Namespaced";
  }

  getStoredVersions() {
    return this.status?.storedVersions.join(", ") ?? "";
  }

  getNames() {
    return this.spec.names;
  }

  getConversion() {
    return JSON.stringify(this.spec.conversion);
  }

  getPrinterColumns(ignorePriority = true): AdditionalPrinterColumnsV1[] {
    const columns = this.getPreferedVersion().additionalPrinterColumns ?? [];

    return columns
      .filter(column => column.name.toLowerCase() != "age" && (ignorePriority || !column.priority));
  }

  getValidation() {
    return JSON.stringify(this.getPreferedVersion().schema, null, 2);
  }

  getConditions() {
    if (!this.status?.conditions) return [];

    return this.status.conditions.map(condition => {
      const { message, reason, lastTransitionTime, status } = condition;

      return {
        ...condition,
        isReady: status === "True",
        tooltip: `${message || reason} (${lastTransitionTime})`,
      };
    });
  }
}

export class CustomResourceDefinitionApi extends KubeApi<CustomResourceDefinition> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      objectConstructor: CustomResourceDefinition,
      checkPreferredVersion: true,
      ...opts,
    });
  }
}

export const crdApi = isClusterPageContext()
  ? new CustomResourceDefinitionApi()
  : undefined as never;
