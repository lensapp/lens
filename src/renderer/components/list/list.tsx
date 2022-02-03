/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./list.module.scss";
import React, { useState } from "react";
import { SearchInput } from "../input";

import type { UseTableOptions } from "react-table";
import { ReactTable } from "../table/react-table";
export type SearchFilter = (item: object) => string | number;

export interface ListProps extends UseTableOptions<any> {
  items: object[];
  filters: SearchFilter[];
  title?: React.ReactNode;
}

export function List({ columns, data, title, items, filters }: ListProps) {
  const [search, setSearch] = useState<string>("");
  const query = search.toLowerCase();

  const filteredData = data.filter((item, index) => (
    filters.some(getText => String(getText(items[index])).toLowerCase().includes(query))
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
