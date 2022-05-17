/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { orderBy } from "lodash";
import type { CatalogCategory, CatalogEntity } from "../../../../common/catalog";
import type { ItemListLayoutProps } from "../../item-object-list";
import browseAllColumnsInjectable from "./browse-all.injectable";
import getColumnsForCategoryInjectable from "./specific-category.injectable";

export interface GetCategoryColumnsParams {
  activeCategory: CatalogCategory | null | undefined;
}

export type CategoryColumns = Required<Pick<ItemListLayoutProps<CatalogEntity>, "sortingCallbacks" | "searchFilters" | "renderTableContents" | "renderTableHeader">>;
export type GetCategoryColumns = (params: GetCategoryColumnsParams) => CategoryColumns;

const getCategoryColumnsInjectable = getInjectable({
  id: "get-category-columns",

  instantiate: (di): GetCategoryColumns => {
    const getColumnsForCategory = di.inject(getColumnsForCategoryInjectable);
    const browseAllColumns = di.inject(browseAllColumnsInjectable);

    return ({ activeCategory }) => {
      const allRegistrations = orderBy(
        activeCategory
          ? getColumnsForCategory(activeCategory)
          : browseAllColumns,
        "priority",
        "asc",
      );

      const sortingCallbacks: CategoryColumns["sortingCallbacks"] = {};
      const searchFilters: CategoryColumns["searchFilters"] = [];
      const renderTableHeader: CategoryColumns["renderTableHeader"] = [];
      const tableRowRenderers: ((entity: CatalogEntity) => React.ReactNode)[] = [];

      for (const registration of allRegistrations) {
        if (registration.sortCallback) {
          sortingCallbacks[registration.id] = registration.sortCallback;
        }

        if (registration.searchFilter) {
          searchFilters.push(registration.searchFilter);
        }

        tableRowRenderers.push(registration.renderCell);
        renderTableHeader.push(registration.titleProps);
      }

      return {
        sortingCallbacks,
        renderTableHeader,
        renderTableContents: entity => tableRowRenderers.map(fn => fn(entity)),
        searchFilters,
      };
    };
  },
});

export default getCategoryColumnsInjectable;
