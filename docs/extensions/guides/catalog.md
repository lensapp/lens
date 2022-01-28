# Catalog (WIP)

This guide is a brief overview about how the catalog works within Lens.
The catalog should be thought of as the single source of truth about data within Lens.

The data flow is unidirectional, it only flows from the main side to the renderer side.
All data is public within the catalog.

## Categories

A category is the declaration to the catalog of a specific kind of entity.
It declares the currently supported versions of that kind of entity but providing the constructors for the entity classes.

To declare a new category class you must create a new class that extends [Common.Catalog.CatalogCategory](../api/classes/Common.Catalog.CatalogCategory.md) and implement all of the abstract fields.

The categories provided by Lens itself have the following names:

- `KubernetesClusters`
- `WebLinks`
- `General`

To register a category, call the `Main.Catalog.catalogCategories.add()` and `Renderer.Catalog.catalogCategories.add()` with instances of your class.

### Custom Category Views

By default when a specific category is selected in the catalog page a list of entities of the group and kind that the category has registered.
It is possible to register custom views for specific categories by registering them on your `Renderer.LensExtension` class.

A registration takes the form of a [Common.Types.CustomCategoryViewRegistration](../api/interfaces/Common.Types.CustomCategoryViewRegistration.md)

For example:

```typescript
import { Renderer, Common } from "@k8slens/extensions";

function MyKubernetesClusterView({
  category,
}: Common.Types.CustomCategoryViewProps) {
  return <div>My view: {category.getId()}</div>;
}

export default class extends Renderer.LensExtension {
  customCategoryViews = [
    {
      group: "entity.k8slens.dev",
      kind: "KubernetesCluster",
      priority: 10,
      components: {
        View: MyKubernetesClusterView,
      },
    },
  ];
}
```

Will register a new view for the KubernetesCluster category, and because the priority is < 50 it will be displayed above the default list view.

The default list view has a priority of 50 and and custom views with priority (defaulting to 50) >= 50 will be displayed afterwards.

#### Styling Custom Views

By default, custom view blocks are styled with [Flexbox](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Flexbox). Some details comes from this.

- To set fixed height of a custom block, use `max-height` css rule.
- To set flexible height, use `height`.
- Otherwise, custom view will have height of it's contents.

## Entities

An entity is the data within the catalog.
All entities are typed and the class instances will be recreated on the renderer side by the catalog and the category registrations.
