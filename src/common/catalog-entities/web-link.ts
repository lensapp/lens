import { CatalogCategory, CatalogEntity, CatalogEntityMetadata, CatalogEntityStatus } from "../catalog";
import { catalogCategoryRegistry } from "../catalog/catalog-category-registry";

export interface WebLinkStatus extends CatalogEntityStatus {
  phase: "valid" | "invalid";
}

export type WebLinkSpec = {
  url: string;
};

export class WebLink extends CatalogEntity<CatalogEntityMetadata, WebLinkStatus, WebLinkSpec> {
  public readonly apiVersion = "entity.k8slens.dev/v1alpha1";
  public readonly kind = "KubernetesCluster";

  getId() {
    return this.metadata.uid;
  }

  getName() {
    return this.metadata.name;
  }

  async onRun() {
    window.open(this.spec.url, "_blank");
  }

  public onSettingsOpen(): void {
    return;
  }

  public onDetailsOpen(): void {
    return;
  }

  public onContextMenuOpen() {
    return;
  }
}

export class WebLinkCategory extends CatalogCategory {
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
