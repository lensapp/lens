/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./item-list-layout.scss";

import React, { ReactNode } from "react";
import { observer } from "mobx-react";
import { cssNames, IClassName } from "../../utils";
import type { ItemObject, ItemStore } from "../../../common/item.store";
import type { Filter } from "./page-filters.store";
import { ItemListLayoutHeaderTitle } from "./header-title";
import { ItemListLayoutHeaderInfo } from "./header-info";
import { ItemListLayoutHeaderFilters } from "./header-filters";
import { ItemListLayoutHeaderSearch } from "./header-search";
import type { HeaderCustomizer, SearchFilter } from "./list-layout";

export interface ItemListLayoutHeaderProps<I extends ItemObject> {
  getItems: () => I[];
  getFilters: () => Filter[];
  toggleFilters: () => void;

  store: ItemStore<I>;
  searchFilters?: SearchFilter<I>[];

  // header (title, filtering, searching, etc.)
  showHeader?: boolean;
  headerClassName?: IClassName;
  renderHeaderTitle?:
    | ReactNode
    | ((parent: ItemListLayoutHeader<I>) => ReactNode);
  customizeHeader?: HeaderCustomizer | HeaderCustomizer[];
}

@observer
export class ItemListLayoutHeader<I extends ItemObject> extends React.Component<
  ItemListLayoutHeaderProps<I>
> {
  render() {
    const {
      showHeader,
      customizeHeader,
      renderHeaderTitle,
      headerClassName,
      searchFilters,
      getItems,
      store,
      getFilters,
      toggleFilters,
    } = this.props;

    if (!showHeader) {
      return null;
    }

    const customizeHeaders = [customizeHeader].flat().filter(Boolean);

    const headerPlaceholders = customizeHeaders.reduce(
      (prevPlaceholders, customizer) => customizer(prevPlaceholders),
      {},
    );


    return (
      <div
        className={cssNames("header flex gaps align-center", headerClassName)}
      >
        <ItemListLayoutHeaderTitle
          renderHeaderTitle={renderHeaderTitle}
          headerPlaceholders={headerPlaceholders}
        />

        <ItemListLayoutHeaderInfo
          headerPlaceholders={headerPlaceholders}
          getItems={getItems}
          store={store}
          getFilters={getFilters}
          toggleFilters={toggleFilters}
        />

        <ItemListLayoutHeaderFilters headerPlaceholders={headerPlaceholders} />

        <ItemListLayoutHeaderSearch
          headerPlaceholders={headerPlaceholders}
          searchFilters={searchFilters}
        />
      </div>
    );
  }
}
