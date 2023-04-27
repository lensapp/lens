/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { buildURL } from "@k8slens/utilities";
import type { BaseKubeObjectCondition, ClusterScopedMetadata } from "../api-types";
import { KubeObject } from "../kube-object";
import type { JSONSchemaProps } from "../types/json-schema-props";
import type { WebhookClientConfig } from "./mutating-webhook-configuration";

export interface AdditionalPrinterColumnsCommon {
  name: string;
  type: "integer" | "number" | "string" | "boolean" | "date";
  priority?: number;
  format?: "int32" | "int64" | "float" | "double" | "byte" | "binary" | "date" | "date-time" | "password";
  description?: string;
}

export type AdditionalPrinterColumnsV1 = AdditionalPrinterColumnsCommon & {
  jsonPath: string;
};

type AdditionalPrinterColumnsV1Beta = AdditionalPrinterColumnsCommon & {
  JSONPath: string;
};

export interface CustomResourceValidation {
  openAPIV3Schema?: JSONSchemaProps;
}

export interface CustomResourceDefinitionVersion {
  name: string;
  served: boolean;
  storage: boolean;
  schema?: CustomResourceValidation; // required in v1 but not present in v1beta
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

export class CustomResourceDefinition extends KubeObject<
  ClusterScopedMetadata,
  CustomResourceDefinitionStatus,
  CustomResourceDefinitionSpec
> {
  static kind = "CustomResourceDefinition";

  static namespaced = false;

  static apiBase = "/apis/apiextensions.k8s.io/v1/customresourcedefinitions";

  getResourceUrl() {
    // TODO: replace this magic string with a use of `customResourcesRouteInjectable` when that is extracted
    return buildURL("/crd/:group?/:name?", {
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

    throw new Error(
      `Unknown apiVersion=${apiVersion}: Failed to find a version for CustomResourceDefinition ${this.metadata.name}`,
    );
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

    return columns.filter((column) => column.name.toLowerCase() !== "age" && (ignorePriority || !column.priority));
  }

  getValidation() {
    return JSON.stringify(this.getPreferedVersion().schema, null, 2);
  }

  getConditions() {
    if (!this.status?.conditions) {
      return [];
    }

    return this.status.conditions.map((condition) => {
      const { message, reason, lastTransitionTime, status } = condition;

      return {
        ...condition,
        isReady: status === "True",
        tooltip: `${message || reason} (${lastTransitionTime})`,
      };
    });
  }
}
