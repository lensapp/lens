# Catalog
Catalog is a special view in Lens IDE interface that aggregates information about important objects and entities.
When developing an extension you can program your entities to be represented in the catalog view, with custom user-facing functionality attached to them via details settings and, context menus.

In catalog view catalog entities are grouped by catalog categories. Each category needs to be registered with an observable source


## CatalogCategoryRegistry
`CatalogCategoryRegistry` keeps track of all entity categories registered with Lens. It is a singleton object that could be imported from extensions API:
```typescript
import { Main, Common } from "@k8slens/extensions";

class CatalogCategory extends Common.Catalog.CatalogCategory {
  public readonly apiVersion = "catalog.k8slens.dev/v1alpha1";
  public readonly kind = "CatalogCategory";
  public metadata = {
    name: "Spaces",
    icon: "scatter_plot"
  };
  public spec: Common.Catalog.CatalogCategorySpec = {
    group: "entity.k8slens.dev",
    versions: [
      {
        name: "v1alpha1",
        entityClass: SpaceCatalogEntity
      }
    ],
    names: {
      kind: spaceCatalogEntityKind
    }
  };
}

const spaceCatalog = new CatalogCategory();

Main.Catalog.catalogCategories.add(spaceCatalog);
```

1. Create an entity
1. Create an entity category
1. Register an entity with `CatalogCategoryRegistry`
1. Add catalog source

## CatalogEntityRegistry
Provides access to current active catalog entity, as well as a function `getItemsForApiKind()`for aggregating registered entities by group and kind.