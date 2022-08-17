/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./list.module.scss";
import themeStyles from "./table-theme.module.scss";

import React, { useState } from "react";
import { SearchInput } from "../input";
import type { TableOptions } from '@tanstack/react-table'

import { TableList } from "../table-list/table-list";

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
    <>
      <div className="flex align-center justify-between mb-6">
        <div className="mr-6">
          {title}
        </div>
        <div>
          <SearchInput
            value={search}
            theme="round-black"
            onChange={setSearch}
            className={styles.searchInput}
          />
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
    </>
  );
}
