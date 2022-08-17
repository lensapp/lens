/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./list.module.scss";
import themeStyles from "./table-theme.module.scss";

import React, { useState } from "react";
import { SearchInput, SearchInputUrl } from "../input";
import type { TableOptions } from '@tanstack/react-table'

import { TableList } from "../table-list/table-list";
import { NamespaceSelectFilter } from "../+namespaces/namespace-select-filter";

export type SearchFilter<T> = (item: T) => string;

export interface ListProps<T> extends TableOptions<T> {
  filters: SearchFilter<T>[];
  title?: React.ReactNode;
}

export function List<T>({ columns, data, title, filters }: ListProps<T>) {
  const [search, setSearch] = useState<string>("");
  const query = search.toLowerCase();

  const filteredData = data.filter((item, index) => (
    filters.some(getText => String(getText(data[index])).toLowerCase().includes(query))
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
{/* 
          <SearchInput
            value={search}
            theme="round-black"
            onChange={setSearch}
            className={styles.searchInput}
          /> */}
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
