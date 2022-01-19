/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "../item-list-layout.scss";

import React, { ReactNode } from "react";
import { observer } from "mobx-react";
import { cssNames, IClassName } from "../../../utils";
import type { ItemObject, ItemStore } from "../../../../common/item.store";
import type { Filter } from "../page-filters.store";
import { ItemListLayoutHeaderTitle } from "./item-list-layout-header-title/item-list-layout-header-title";
import { ItemListLayoutHeaderInfo } from "./item-list-layout-header-info/item-list-layout-header-info";
import { ItemListLayoutHeaderFilters } from "./item-list-layout-header-filters/item-list-layout-header-filters";
import { ItemListLayoutHeaderSearch } from "./item-list-layout-header-search/item-list-layout-header-search";
import type { HeaderCustomizer, SearchFilter } from "../item-list-layout";

interface ItemListLayoutHeaderProps<I extends ItemObject> {
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
          getItems={this.props.getItems}
          store={this.props.store}
          getFilters={this.props.getFilters}
          toggleFilters={this.props.toggleFilters}
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
