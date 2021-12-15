/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { KubeCreationError, KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import { crdResourcesURL } from "../../routes";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";
import type { KubeJsonApiData } from "../kube-json-api";

type AdditionalPrinterColumnsCommon = {
  name: string;
  type: "integer" | "number" | "string" | "boolean" | "date";
  priority: number;
  description: string;
};

export type AdditionalPrinterColumnsV1 = AdditionalPrinterColumnsCommon & {
  jsonPath: string;
};

type AdditionalPrinterColumnsV1Beta = AdditionalPrinterColumnsCommon & {
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
}

export interface CRDApiData extends KubeJsonApiData {
  spec: object; // TODO: make better
}

export class CustomResourceDefinition extends KubeObject {
  static kind = "CustomResourceDefinition";
  static namespaced = false;
  static apiBase = "/apis/apiextensions.k8s.io/v1/customresourcedefinitions";

  constructor(data: CRDApiData) {
    super(data);

    if (!data.spec || typeof data.spec !== "object") {
      throw new KubeCreationError("Cannot create a CustomResourceDefinition from an object without spec", data);
    }
  }

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

    return name[0].toUpperCase() + name.substr(1);
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
 * Only available within kubernetes cluster pages
 */
let crdApi: KubeApi<CustomResourceDefinition>;

if (isClusterPageContext()) {
  crdApi = new KubeApi<CustomResourceDefinition>({
    objectConstructor: CustomResourceDefinition,
    checkPreferredVersion: true,
  });
}

export {
  crdApi,
};
