import { observable } from "mobx";
import { CatalogCategory, CatalogEntity, CatalogEntityData, CatalogEntityMetadata, CatalogEntityStatus } from "../catalog-entity";
import { catalogCategoryRegistry } from "../catalog-category-registry";

export interface WebLinkStatus extends CatalogEntityStatus {
  phase: "valid" | "invalid";
}

export type WebLinkSpec = {
  url: string;
};

export class WebLink implements CatalogEntity {
  public readonly apiVersion = "entity.k8slens.dev/v1alpha1";
  public readonly kind = "KubernetesCluster";
  @observable public metadata: CatalogEntityMetadata;
  @observable public status: WebLinkStatus;
  @observable public spec: WebLinkSpec;

  constructor(data: CatalogEntityData) {
    this.metadata = data.metadata;
    this.status = data.status as WebLinkStatus;
    this.spec = data.spec as WebLinkSpec;
  }

  getId() {
    return this.metadata.uid;
  }

  getName() {
    return this.metadata.name;
  }

  async onRun() {
    window.open(this.spec.url, "_blank");
  }

  async onDetailsOpen() {
    //
  }

  async onContextMenuOpen() {
    //
  }
}

export class WebLinkCategory implements CatalogCategory {
  public readonly apiVersion = "catalog.k8slens.dev/v1alpha1";
  public readonly kind = "CatalogCategory";
  public metadata = {
    name: "Web Links",
    icon: "link"
  };
  public spec = {
    group: "entity.k8slens.dev",
    versions: [
      {
        name: "v1alpha1",
        entityClass: WebLink
      }
    ],
    names: {
      kind: "WebLink"
    }
  };

  getId() {
    return `${this.spec.group}/${this.spec.names.kind}`;
  }
}

catalogCategoryRegistry.add(new WebLinkCategory());
