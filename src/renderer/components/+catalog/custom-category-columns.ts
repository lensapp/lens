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

import type React from "react";
import type { CatalogEntity } from "../../../common/catalog";
import type { TableCellProps } from "../table";

/**
 * These are the supported props for the title cell
 */
export interface TitleCellProps {
  className?: string;
  title?: React.ReactNode;
}

/**
 * This is the type used to declare new catalog category columns
 */
export interface AdditionalCategoryColumnRegistration {
  /**
   * The catalog entity kind that is declared by the category for this registration
   *
   * e.g.
   * - `"KubernetesCluster"`
   */
  kind: string;

  /**
   * The catalog entity group that is declared by the category for this registration
   *
   * e.g.
   * - `"entity.k8slens.dev"`
   */
  group: string;

  /**
   * The sorting order value.
   *
   * @default 50
   */
  priority?: number;

  /**
   * This value MUST to be unique to your extension
   */
  id: string;

  /**
   * This function will be called to generate the cells (on demand) for the column
   */
  renderCell: (entity: CatalogEntity) => React.ReactNode;

  /**
   * This function will be used to generate the columns title cell.
   */
  titleProps: TitleCellProps;

  /**
   * If provided then the column will support sorting and this function will be called to
   * determine a row's ordering.
   *
   * strings are sorted ahead of numbers, and arrays determine ordering between equal
   * elements of the previous index.
   */
  sortCallback?: (entity: CatalogEntity) => string | number | (string | number)[];

  /**
   * If provided then searching is supported on this column and this function will be called
   * to determine if the current search string matches for this row.
   */
  searchFilter?: (entity: CatalogEntity) => string | string[];
}

export interface RegisteredAdditionalCategoryColumn {
  id: string;
  priority: number;
  renderCell: (entity: CatalogEntity) => React.ReactNode;
  titleProps: TableCellProps;
  sortCallback?: (entity: CatalogEntity) => string | number | (string | number)[];
  searchFilter?: (entity: CatalogEntity) => string | string[];
}
