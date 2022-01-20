# Extending KubernetesCluster

Extension can specify it's own subclass of Common.Catalog.KubernetesCluster. Extension can also specify a new Category for it in the Catalog.

## Extending Common.Catalog.KubernetesCluster

``` typescript
import { Common } from "@k8slens/extensions";

// The kind must be different from KubernetesCluster's kind
export const kind = "ManagedDevCluster";

export class ManagedDevCluster extends Common.Catalog.KubernetesCluster {
  public static readonly kind = kind;

  public readonly kind = kind;
}
```

## Extending Common.Catalog.CatalogCategory

These custom Catalog entities can be added a new Category in the Catalog.

``` typescript
import { Common } from "@k8slens/extensions";
import { kind, ManagedDevCluster } from "../entities/ManagedDevCluster";

class ManagedDevClusterCategory extends Common.Catalog.CatalogCategory {
  public readonly apiVersion = "catalog.k8slens.dev/v1alpha1";
  public readonly kind = "CatalogCategory";
  public metadata = {
    name: "Managed Dev Clusters",
    icon: ""
  };
  public spec: Common.Catalog.CatalogCategorySpec = {
    group: "entity.k8slens.dev",
    versions: [
      {
        name: "v1alpha1",
        entityClass: ManagedDevCluster as any,
      },
    ],
    names: {
      kind
    },
  };
}

export { ManagedDevClusterCategory };
export type { ManagedDevClusterCategory as ManagedDevClusterCategoryType };
```

The category needs to be registered in the `onActivate()` method both in main and renderer

``` typescript
// in main's on onActivate
Main.Catalog.catalogCategories.add(new ManagedDevClusterCategory());
```

``` typescript
// in renderer's on onActivate
Renderer.Catalog.catalogCategories.add(new ManagedDevClusterCategory());
```

You can then add the entities to the Catalog as a new source:

``` typescript
this.addCatalogSource("managedDevClusters", this.managedDevClusters);
```
