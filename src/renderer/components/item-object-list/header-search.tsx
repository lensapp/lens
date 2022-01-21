/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { observer } from "mobx-react";
import type { ItemObject } from "../../../common/item.store";
import { SearchInputUrl } from "../input";
import React from "react";
import type { HeaderPlaceholders, SearchFilter } from "./list-layout";

interface ItemListLayoutHeaderSearchProps<I extends ItemObject> {
  searchFilters: SearchFilter<I>[];
  headerPlaceholders: HeaderPlaceholders;
}

export const ItemListLayoutHeaderSearch = observer(<I extends ItemObject>({
  searchFilters,
  headerPlaceholders = {},
}: ItemListLayoutHeaderSearchProps<I>) => {
  const { searchProps } = headerPlaceholders;

  if (searchFilters.length === 0 || !searchProps) {
    return null;
  }

  return <SearchInputUrl {...searchProps} />;
});
