/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./item-list-layout.scss";

import React from "react";
import { PageFiltersList } from "./page-filters/list";
import { observer } from "mobx-react";
import type { Filter } from "./page-filters/store";

export interface ItemListLayoutFilterProps {
  getIsReady: () => boolean;
  getFilters: () => Filter[];
  getFiltersAreShown: () => boolean;
  hideFilters: boolean;
}

export const ItemListLayoutFilters = observer(({ getFilters, getFiltersAreShown, getIsReady, hideFilters }: ItemListLayoutFilterProps) => {
  const filters = getFilters();

  if (!getIsReady() || !filters.length || hideFilters || !getFiltersAreShown()) {
    return null;
  }

  return <PageFiltersList filters={filters} />;
});

