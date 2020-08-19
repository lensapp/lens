import { KubeObject } from "../kube-object";
import { VersionedKubeApi } from "../kube-api-versioned";
import { crdResourcesURL } from "../../components/+custom-resources/crd.route";


type AdditionalPrinterColumnsCommon = {
  name: string;
  type: "integer" | "number" | "string" | "boolean" | "date";
  priority: number;
  description: string;
}

type AdditionalPrinterColumnsV1 = AdditionalPrinterColumnsCommon & { 
  jsonPath: string; 
}

type AdditionalPrinterColumnsV1Beta = AdditionalPrinterColumnsCommon & { 
  JSONPath: string; 
}

export class CustomResourceDefinition extends KubeObject {
  static kind = "CustomResourceDefinition";

  spec: {
    group: string;
    version?: string;
    names: {
      plural: string;
      singular: string;
      kind: string;
      listKind: string;
    };
    scope: "Namespaced" | "Cluster" | string;
    validation?: any;
    versions: {
      name: string;
      served: boolean;
      storage: boolean;
      additionalPrinterColumns?: AdditionalPrinterColumnsV1[]
    }[];
    conversion: {
      strategy?: string;
      webhook?: any;
    };
    additionalPrinterColumns?: AdditionalPrinterColumnsV1Beta[];
  }
  status: {
    conditions: {
      lastTransitionTime: string;
      message: string;
      reason: string;
      status: string;
      type: string;
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

  getResourceUrl() {
    return crdResourcesURL({
      params: {
        group: this.getGroup(),
        name: this.getPluralName(),
      }
    })
  }

  getResourceApiBase() {
    const { group } = this.spec;
    return `/apis/${group}/${this.getVersion()}/${this.getPluralName()}`
  }

  getPluralName() {
    return this.getNames().plural
  }

  getResourceKind() {
    return this.spec.names.kind
  }

  getResourceTitle() {
    const name = this.getPluralName();
    return name[0].toUpperCase() + name.substr(1)
  }

  getGroup() {
    return this.spec.group;
  }

  getScope() {
    return this.spec.scope;
  }

  getVersion() {
    return this.spec.version ?? this.spec.versions.find(a => a.storage)?.name;
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

  getPrinterColumns(ignorePriority = true) {
    const columns = this.spec.versions.find(a => this.getVersion() == a.name)?.additionalPrinterColumns
      ?? this.spec.additionalPrinterColumns?.map(({JSONPath, ...rest}) => ({ ...rest, jsonPath: JSONPath })) // map to V1 shape
      ?? [];
    return columns
      .filter(column => column.name != "Age")
      .filter(column => ignorePriority ? true : !column.priority);
  }

  getValidation() {
    return JSON.stringify(this.spec.validation, null, 2);
  }

  getConditions() {
    if (!this.status.conditions) return [];
    return this.status.conditions.map(condition => {
      const { message, reason, lastTransitionTime, status } = condition;
      return {
        ...condition,
        isReady: status === "True",
        tooltip: `${message || reason} (${lastTransitionTime})`
      }
    });
  }
}

export const crdApi = new VersionedKubeApi<CustomResourceDefinition>({
  kind: CustomResourceDefinition.kind,
  apiBase: "/apis/apiextensions.k8s.io/v1/customresourcedefinitions",
  isNamespaced: false,
  objectConstructor: CustomResourceDefinition
});

