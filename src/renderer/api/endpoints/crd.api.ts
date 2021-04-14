import { KubeObject } from "../kube-object";
import { crdResourcesURL } from "../../components/+custom-resources/crd.route";
import { KubeApi } from "../kube-api";

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

interface CustomResourceDefinitionSpec {
  group: string;
  version?: string; // deprecated in v1 api
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
    schema?: unknown; // required in v1 but not present in v1beta
    additionalPrinterColumns?: AdditionalPrinterColumnsV1[];
  }[];
  conversion: {
    strategy?: string;
    webhook?: any;
  };
  additionalPrinterColumns?: AdditionalPrinterColumnsV1Beta[]; // removed in v1
}

interface CustomResourceDefinitionStatus {
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

export class CustomResourceDefinition extends KubeObject<CustomResourceDefinitionSpec, CustomResourceDefinitionStatus> {
  static kind = "CustomResourceDefinition";
  static namespaced = false;
  static apiBase = "/apis/apiextensions.k8s.io/v1/customresourcedefinitions";

  getResourceUrl() {
    const group = this.getGroup();
    const name = this.getPluralName();

    if (group && name) {
      return crdResourcesURL({ params: { group, name } });
    }
  }

  getResourceApiBase() {
    const { group } = this.spec ?? {};

    return `/apis/${group}/${this.getVersion()}/${this.getPluralName()}`;
  }

  getPluralName() {
    return this.getNames()?.plural;
  }

  getResourceKind() {
    return this.spec?.names.kind;
  }

  getResourceTitle() {
    const name = this.getPluralName();

    if (name) {
      return name[0].toUpperCase() + name.substr(1);
    }
  }

  getGroup() {
    return this.spec?.group;
  }

  getScope() {
    return this.spec?.scope;
  }

  getVersion() {
    // v1 has removed the spec.version property, if it is present it must match the first version
    return this.spec?.versions[0]?.name ?? this.spec?.version;
  }

  isNamespaced() {
    return this.getScope() === "Namespaced";
  }

  getStoredVersions() {
    return this.status?.storedVersions.join(", ");
  }

  getNames() {
    return this.spec?.names;
  }

  getConversion() {
    return JSON.stringify(this.spec?.conversion);
  }

  getPrinterColumns(ignorePriority = true): AdditionalPrinterColumnsV1[] {
    const columns = this.spec?.versions.find(a => this.getVersion() == a.name)?.additionalPrinterColumns
      ?? this.spec?.additionalPrinterColumns?.map(({ JSONPath, ...rest }) => ({ ...rest, jsonPath: JSONPath })) // map to V1 shape
      ?? [];

    return columns
      .filter(column => column.name != "Age")
      .filter(column => ignorePriority ? true : !column.priority);
  }

  getValidation() {
    return JSON.stringify(this.spec?.validation ?? this.spec?.versions?.[0]?.schema, null, 2);
  }

  getConditions() {
    if (!this.status?.conditions) return [];

    return this.status?.conditions.map(condition => {
      const { message, reason, lastTransitionTime, status } = condition;

      return {
        ...condition,
        isReady: status === "True",
        tooltip: `${message || reason} (${lastTransitionTime})`
      };
    });
  }
}

export const crdApi = new KubeApi({
  objectConstructor: CustomResourceDefinition,
  checkPreferredVersion: true,
});
