/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { orderBy } from "lodash";
import type { IComputedValue } from "mobx";
import type { CatalogCategory, CatalogEntity } from "../../../../common/catalog";
import { bind } from "../../../utils";
import type { ItemListLayoutProps } from "../../item-object-list";
import type { RegisteredAdditionalCategoryColumn } from "../custom-category-columns";
import categoryColumnsInjectable from "../custom-category-columns.injectable";
import { defaultCategoryColumns, browseAllColumns, nameCategoryColumn } from "./internal-columns";

interface Dependencies {
  extensionColumns: IComputedValue<Map<string, Map<string, RegisteredAdditionalCategoryColumn[]>>>;
}

export interface GetCategoryColumnsParams {
  activeCategory: CatalogCategory | null | undefined;
}

export type CategoryColumns = Required<Pick<ItemListLayoutProps<CatalogEntity>, "sortingCallbacks" | "searchFilters" | "renderTableContents" | "renderTableHeader">>;

function getSpecificCategoryColumns(activeCategory: CatalogCategory, extensionColumns: IComputedValue<Map<string, Map<string, RegisteredAdditionalCategoryColumn[]>>>): RegisteredAdditionalCategoryColumn[] {
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
}

function getBrowseAllColumns(): RegisteredAdditionalCategoryColumn[] {
  return [
    ...browseAllColumns,
    nameCategoryColumn,
    ...defaultCategoryColumns,
  ];
}

function getCategoryColumns({ extensionColumns }: Dependencies, { activeCategory }: GetCategoryColumnsParams): CategoryColumns {
  const allRegistrations = orderBy(
    activeCategory
      ? getSpecificCategoryColumns(activeCategory, extensionColumns)
      : getBrowseAllColumns(),
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
}

const getCategoryColumnsInjectable = getInjectable({
  instantiate: (di) => bind(getCategoryColumns, null, {
    extensionColumns: di.inject(categoryColumnsInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default getCategoryColumnsInjectable;
