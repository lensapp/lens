/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./list.module.scss";
import themeStyles from "./table-theme.module.scss";

import React, { useEffect, useState } from "react";
import { SearchInputUrl } from "../input";
import type { TableOptions } from '@tanstack/react-table'

import { TableList } from "../table-list/table-list";
import { NamespaceSelectFilter } from "../+namespaces/namespace-select-filter";
import { withInjectables } from "@ogre-tools/injectable-react";
import { FilterType, PageFiltersStore } from "../item-object-list/page-filters/store";
import pageFiltersStoreInjectable from "../item-object-list/page-filters/store.injectable";
import { observer } from "mobx-react";

export type SearchFilter<T> = (item: T) => string;

export interface ListProps<T> extends TableOptions<T> {
  filters: SearchFilter<T>[];
  title?: React.ReactNode;
}

interface Dependencies {
  pageFiltersStore: PageFiltersStore;
}

export function NonInjectedList<T>({ columns, data, title, filters, pageFiltersStore }: ListProps<T> & Dependencies) {
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const searchFilter = pageFiltersStore.activeFilters.find(({ type }) => type === FilterType.SEARCH);
    const searchValue = searchFilter?.value ?? "";

    setSearch(searchValue);
  }, [pageFiltersStore.activeFilters]);

  const filteredData = data.filter((item, index) => (
    filters.some(getText => String(getText(data[index])).toLowerCase().includes(search.toLowerCase()))
  ));

  return (
    <div className={styles.listLayout}>
      <div className={styles.header}>
        <div>
          {title}
        </div>
        <div>
          Showing {filteredData.length} items
        </div>
        <div className={styles.controls}>
          <NamespaceSelectFilter id="object-list-layout-namespace-select-input" />
          <SearchInputUrl />
        </div>
      </div>
      <TableList
        columns={columns}
        data={filteredData}
        className={themeStyles.tableTheme}
      />
      {filteredData.length == 0 && (
        <div className={styles.notFound}>No data found</div>
      )}
    </div>
  );
}

export const List = withInjectables<Dependencies, ListProps<any>>(
  observer(NonInjectedList), {
  getProps: (di, props) => ({
    ...props,
    pageFiltersStore: di.inject(pageFiltersStoreInjectable),
  }),
})