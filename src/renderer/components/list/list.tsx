/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import styles from "./list.module.css";
import React, { useState } from "react";
import { SearchInput } from "../input";

import type { UseTableOptions } from "react-table";
import { ReactTable } from "../table/react-table";
export type SearchFilter = (item: object) => string | number;

interface Props extends UseTableOptions<any> {
  items: object[];
  filters: SearchFilter[];
  title?: React.ReactNode;
}

export function List({ columns, data, title, items, filters }: Props) {
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
