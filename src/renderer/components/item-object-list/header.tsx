/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./item-list-layout.scss";

import type { ReactNode } from "react";
import React from "react";
import { observer } from "mobx-react";
import type { IClassName } from "../../utils";
import { cssNames, isDefined } from "../../utils";
import type { ItemObject } from "../../../common/item.store";
import type { Filter } from "./page-filters.store";
import type { HeaderCustomizer, HeaderPlaceholders, ItemListStore, SearchFilter } from "./list-layout";
import { SearchInputUrl } from "../input";

export interface ItemListLayoutHeaderProps<I extends ItemObject, PreLoadStores extends boolean> {
  getItems: () => I[];
  getFilters: () => Filter[];
  toggleFilters: () => void;

  store: ItemListStore<I, PreLoadStores>;
  searchFilters?: SearchFilter<I>[];

  // header (title, filtering, searching, etc.)
  showHeader?: boolean;
  headerClassName?: IClassName;
  renderHeaderTitle?:
    | ReactNode
    | ((parent: ItemListLayoutHeader<I, PreLoadStores>) => ReactNode);
  customizeHeader?: HeaderCustomizer | HeaderCustomizer[];
}

@observer
export class ItemListLayoutHeader<I extends ItemObject, PreLoadStores extends boolean> extends React.Component<ItemListLayoutHeaderProps<I, PreLoadStores>> {
  render() {
    const {
      showHeader,
      customizeHeader,
      renderHeaderTitle,
      headerClassName,
      searchFilters = [],
      getItems,
      store,
      getFilters,
      toggleFilters,
    } = this.props;

    if (!showHeader) {
      return null;
    }

    const renderInfo = () => {
      const allItemsCount = store.getTotalCount();
      const itemsCount = getItems().length;

      if (getFilters().length > 0) {
        return (
          <>
            <a onClick={toggleFilters}>Filtered</a>
            {`: ${itemsCount} / ${allItemsCount}`}
          </>
        );
      }

      return allItemsCount === 1
        ? `${allItemsCount} item`
        : `${allItemsCount} items`;
    };

    const customizeHeaderFunctions = [customizeHeader].flat().filter(isDefined);
    const renderedTitle = typeof renderHeaderTitle === "function"
      ? renderHeaderTitle(this)
      : renderHeaderTitle;

    const {
      filters,
      info,
      searchProps,
      title,
    } = customizeHeaderFunctions.reduce<HeaderPlaceholders>(
      (prevPlaceholders, customizer) => customizer(prevPlaceholders),
      {
        title: <h5 className="title">{renderedTitle}</h5>,
        info: renderInfo(),
        searchProps: {},
      },
    );

    return (
      <div className={cssNames("header flex gaps align-center", headerClassName)}>
        {title}
        {
          info && (
            <div className="info-panel box grow">
              {info}
            </div>
          )
        }
        {filters}
        {searchFilters.length > 0 && searchProps && <SearchInputUrl {...searchProps} />}
      </div>
    );
  }
}
