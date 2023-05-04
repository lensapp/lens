/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./list.module.scss";
import React, { useState } from "react";
import { SearchInput } from "../input";

import type { UseTableOptions } from "react-table";
import { ReactTable } from "../table/react-table";
import type { StrictReactNode } from "@k8slens/utilities";

export type SearchFilter<T> = (item: T) => string | number;

export interface ListProps<I, T extends object> extends UseTableOptions<T> {
  items: I[];
  filters: SearchFilter<I>[];
  title?: StrictReactNode;
}

export function List<I, T extends object>({ columns, data, title, items, filters }: ListProps<I, T>) {
  const [search, setSearch] = useState<string>("");
  const query = search.toLowerCase();

  const filteredData = data.filter((item, index) => (
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    filters.some(getText => String(getText(items[index]!)).toLowerCase().includes(query))
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
      <ReactTable columns={columns} data={filteredData}/>
      {filteredData.length == 0 && (
        <div className={styles.notFound}>No data found</div>
      )}
    </>
  );
}
