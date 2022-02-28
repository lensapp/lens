/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject, KubeObjectMetadata } from "../kube-object";
import { BaseKubeApiOptions, KubeApi } from "../kube-api";
import { crdResourcesURL } from "../../routes";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export interface AdditionalPrinterColumnsCommon {
  name: string;
  type: "integer" | "number" | "string" | "boolean" | "date";
  priority: number;
  description: string;
}

export type AdditionalPrinterColumnsV1 = AdditionalPrinterColumnsCommon & {
  jsonPath: string;
};

export type AdditionalPrinterColumnsV1Beta = AdditionalPrinterColumnsCommon & {
  JSONPath: string;
};

export interface CRDVersion {
  name: string;
  served: boolean;
  storage: boolean;
  schema?: object; // required in v1 but not present in v1beta
  additionalPrinterColumns?: AdditionalPrinterColumnsV1[];
}

export interface CustomResourceDefinitionSpec {
  group: string;
  /**
   * @deprecated for apiextensions.k8s.io/v1 but used in v1beta1
   */
  version?: string;
  names: {
    plural: string;
    singular: string;
    kind: string;
    listKind: string;
  };
  scope: "Namespaced" | "Cluster";
  /**
   * @deprecated for apiextensions.k8s.io/v1 but used in v1beta1
   */
  validation?: object;
  versions?: CRDVersion[];
  conversion: {
    strategy?: string;
    webhook?: any;
  };
  /**
   * @deprecated for apiextensions.k8s.io/v1 but used in v1beta1
   */
  additionalPrinterColumns?: AdditionalPrinterColumnsV1Beta[];
}

export interface CustomResourceDefinition {
  spec: CustomResourceDefinitionSpec;
  status: {
    conditions: {
      lastTransitionTime: string;
      message: string;
      reason: string;
      status: string;
      type?: string;
    }[];
    acceptedNames: {
      plural: string;
      singular: string;
      kind: string;
      shortNames: string[];
      listKind: string;
    };
    storedVersions: string[];
  };
  /**
   * @deprecated for apiextensions.k8s.io/v1 but used previously
   */
  additionalPrinterColumns?: AdditionalPrinterColumnsV1Beta[];
}

export interface CustomResourceDefinitionStatus {
  conditions: {
    lastTransitionTime: string;
    message: string;
    reason: string;
    status: string;
    type?: string;
  }[];
  acceptedNames: {
    plural: string;
    singular: string;
    kind: string;
    shortNames: string[];
    listKind: string;
  };
  storedVersions: string[];
}

export class CustomResourceDefinition extends KubeObject<KubeObjectMetadata, CustomResourceDefinitionStatus, CustomResourceDefinitionSpec> {
  static kind = "CustomResourceDefinition";
  static namespaced = false;
  static apiBase = "/apis/apiextensions.k8s.io/v1/customresourcedefinitions";

  getResourceUrl() {
    return crdResourcesURL({
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

  getPreferedVersion(): CRDVersion {
    const { apiVersion } = this;

    switch (apiVersion) {
      case "apiextensions.k8s.io/v1":
        for (const version of this.spec.versions) {
          if (version.storage) {
            return version;
          }
        }
        break;

      case "apiextensions.k8s.io/v1beta1": {
        const { additionalPrinterColumns: apc } = this.spec;
        const additionalPrinterColumns = apc?.map(({ JSONPath, ...apc }) => ({ ...apc, jsonPath: JSONPath }));

        return {
          name: this.spec.version,
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
    return this.status.storedVersions.join(", ");
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

/**
 * The api type for {@link CustomResourceDefinition}'s
 */
export class CustomResourceDefinitionApi extends KubeApi<CustomResourceDefinition> {
  constructor(params?: Pick<BaseKubeApiOptions, "request">) {
    super({
      ...(params ?? {}),
      objectConstructor: CustomResourceDefinition,
      checkPreferredVersion: true,
    });
  }
}

/**
 * Only available within kubernetes cluster pages
 */
export const crdApi = isClusterPageContext()
  ? new CustomResourceDefinitionApi()
  : undefined;
