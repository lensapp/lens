/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ReactNode } from "react";
import type { SingleOrMany } from "@k8slens/utilities";

export interface ItemObject {
  getId: () => string;
  getName: () => string;
}

export type TableSortBy = string;
export type TableOrderBy = "asc" | "desc";
export interface TableSortParams {
  sortBy: TableSortBy;
  orderBy: TableOrderBy;
}

export type TableSortCallback<Item> = (data: Item) => undefined | string | number | (string | number)[];
export type TableSortCallbacks<Item> = Record<string, TableSortCallback<Item>>;

export type SearchFilter<I extends ItemObject> = (item: I) => SingleOrMany<string | number | undefined | null>;

export interface TableCellProps extends React.DOMAttributes<HTMLDivElement> {
  /**
   * used for configuration visibility of columns
   */
  id?: string;

  /**
   * Any css class names for this table cell. Only used if `title` is a "simple" react node
   */
  className?: string;

  /**
   * The actual value of the cell
   */
  title?: ReactNode;

  /**
   * content inside could be scrolled
   */
  scrollable?: boolean;

  /**
   * render cell with a checkbox
   */
  checkbox?: boolean;

  /**
   * mark checkbox as checked or not
   */
  isChecked?: boolean;

  /**
   * column name, must be same as key in sortable object <Table sortable={}/>
   */
  sortBy?: TableSortBy;

  /**
   * id of the column which follow same visibility rules
   */
  showWithColumn?: string;

  /**
   * @internal
   */
  _sorting?: Partial<TableSortParams>;

  /**
   * @internal
   */
  _sort?(sortBy: TableSortBy): void;

  /**
   * @internal
   * indicator, might come from parent <TableHead>, don't use this prop outside (!)
   */
  _nowrap?: boolean;
}
