/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { observer } from "mobx-react";
import type { ItemObject, ItemStore } from "../../../../../common/item.store";
import type { Filter } from "../../page-filters.store";
import type { HeaderPlaceholders } from "../../item-list-layout";

interface ItemListLayoutHeaderInfoProps<I extends ItemObject> {
  headerPlaceholders: HeaderPlaceholders;
  getItems: () => I[];
  store: ItemStore<I>;
  getFilters: () => Filter[]
  toggleFilters: () => void
}

export const ItemListLayoutHeaderInfo = observer(
  <I extends ItemObject>(props: ItemListLayoutHeaderInfoProps<I>) => {
    const { headerPlaceholders, getItems, getFilters, store, toggleFilters } =
      props;

    const renderInfo = () => {
      const allItemsCount = store.getTotalCount();
      const itemsCount = getItems().length;

      if (getFilters().length > 0) {
        return (
          <>
            <a onClick={toggleFilters}>Filtered</a>: {itemsCount} /{" "}
            {allItemsCount}
          </>
        );
      }

      return allItemsCount === 1
        ? `${allItemsCount} item`
        : `${allItemsCount} items`;
    };

    const info =
      headerPlaceholders.info === undefined
        ? renderInfo()
        : headerPlaceholders.info;

    if (!info) {
      return null;
    }

    return <div className="info-panel box grow">{info}</div>;
  },
);
