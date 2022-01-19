/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type React from "react";
import type { CatalogEntity } from "../../../common/catalog";
import type { TableCellProps } from "../table";

/**
 * These are the supported props for the title cell
 */
export interface TitleCellProps {
  className?: string;
  title: React.ReactNode;
}

export interface CategoryColumnRegistration {
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

/**
 * This is the type used to declare new catalog category columns
 */
export interface AdditionalCategoryColumnRegistration extends CategoryColumnRegistration {
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
}

export interface RegisteredAdditionalCategoryColumn {
  id: string;
  priority: number;
  renderCell: (entity: CatalogEntity) => React.ReactNode;
  titleProps: TableCellProps;
  sortCallback?: (entity: CatalogEntity) => string | number | (string | number)[];
  searchFilter?: (entity: CatalogEntity) => string | string[];
}
