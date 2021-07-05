# Catalog
Catalog is a special view in Lens IDE interface that aggregates information about important objects and entities.
When developing an extension you can program your entities to be represented in the catalog view, with custom user-facing functionality attached to them via details settings and, context menus.

In catalog view catalog entities are grouped by catalog categories. Each category needs to be registered with an observable source

## CatalogCategoryRegistry
`CatalogCategoryRegistry` keeps track of all entity categories registered with Lens. It is a singleton object that could be imported from extensions API:

1. Create an entity
First, you'll have to create an entity by extending a `CatalogEntity` class. You can provide your own types for entity metadata, status info and specification.
  ```typescript
  import { Common } from "@k8slens/extensions";

  export const Kind = "MyEntity";

  export class MyCatalogEntity extends Common.Catalog.CatalogEntity<
    Common.Catalog.CatalogEntityMetadata,
    CatalogEntityStatus
  > {
    public readonly apiVersion = "entity.k8slens.dev/v1alpha1";
    public readonly kind = Kind;

    async onRun(ctx: Common.Catalog.CatalogEntityActionContext) {
      // Is called once the user interacts with the entity, e.g. clicks on a hotbar item
    }

    onDetailsOpen(): void {
      // Is called when the user launches detailed view of the entity
    }

    onSettingsOpen(): void {
      // Is called when the user launches settings view of the entity
    }

    onContextMenuOpen(): void {
      // Is called when the user opens the context menu for the entity
    }
  }
  ```
1. Create an entity category
  ```typescript
  import { Main, Common } from "@k8slens/extensions";
  import { MyCatalogEntity, Kind } from ".";

  class CatalogCategory extends Common.Catalog.CatalogCategory {
    public readonly apiVersion = "catalog.k8slens.dev/v1alpha1";
    public readonly kind = "CatalogCategory";
    public metadata = {
      name: "My Entities",
      icon: "scatter_plot"
    };
    public spec: Common.Catalog.CatalogCategorySpec = {
      group: "entity.k8slens.dev",
      versions: [
        {
          name: "v1alpha1",
          entityClass: MyCatalogEntity
        }
      ],
      names: {
        kind: Kind
      }
    };
  }
  ```

1. Register an entity with `CatalogCategoryRegistry` and add a source

```typescript
export default class LensCloudExtensionMain extends Main.LensExtension {
  // ...
  private myCatalog = new CatalogCategory();
  private myEntitySource: IObservableArray<MyCatalogEntity>;

  async onActivate() {
    Main.Catalog.catalogCategories.add(this.myCatalog);
    this.addCatalogSource("spaceCatalogEntiesSource", this.myEntitySource);
    // ...
  }
}
```

## CatalogEntityRegistry
Provides access to current active catalog entity, as well as a function `getItemsForApiKind()`for aggregating registered entities by group and kind.