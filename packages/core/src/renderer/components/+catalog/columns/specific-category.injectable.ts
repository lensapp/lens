/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { CatalogCategory } from "../../../api/catalog-entity";
import type { RegisteredAdditionalCategoryColumn } from "../custom-category-columns";
import categoryColumnsInjectable from "../custom-category-columns.injectable";
import defaultCategoryColumnsInjectable from "./default-category.injectable";
import namedCategoryColumnInjectable from "./named-category.injectable";

export type GetColumnsForCategory = (activeCategory: CatalogCategory) => RegisteredAdditionalCategoryColumn[];

const getColumnsForCategoryInjectable = getInjectable({
  id: "get-columns-for-category",
  instantiate: (di): GetColumnsForCategory => {
    const extensionColumns = di.inject(categoryColumnsInjectable);
    const defaultCategoryColumns = di.inject(defaultCategoryColumnsInjectable);
    const nameCategoryColumn = di.inject(namedCategoryColumnInjectable);

    return (activeCategory) => {
      const fromExtensions = (
        extensionColumns
          .get()
          .get(activeCategory.spec.group)
          ?.get(activeCategory.spec.names.kind)
        ?? []
      );
      const fromCategory = activeCategory.spec.displayColumns?.map(({ priority = 50, ...column }) => ({
        priority,
        ...column,
      })) ?? defaultCategoryColumns;

      return [
        nameCategoryColumn,
        ...fromExtensions,
        ...fromCategory,
      ];
    };
  },
});

export default getColumnsForCategoryInjectable;
