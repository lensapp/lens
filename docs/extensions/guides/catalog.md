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

## Entities

An entity is the data within the catalog.
All entities are typed and the class instances will be recreated on the renderer side by the catalog and the category registrations.
