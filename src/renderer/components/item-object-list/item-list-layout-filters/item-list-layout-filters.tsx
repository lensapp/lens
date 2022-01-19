/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "../item-list-layout.scss";

import React from "react";
import { PageFiltersList } from "../page-filters-list";
import { observer } from "mobx-react";
import type { Filter } from "../page-filters.store";

interface ItemListLayoutFilterProps {
  getIsReady: () => boolean
  getFilters: () => Filter[]
  getFiltersAreShown: () => boolean
  hideFilters: boolean
}

@observer
export class ItemListLayoutFilters extends React.Component<ItemListLayoutFilterProps> {
  render() {
    const filters = this.props.getFilters();

    if (!this.props.getIsReady() || !filters.length || this.props.hideFilters || !this.props.getFiltersAreShown()) {
      return null;
    }

    return <PageFiltersList filters={filters} />;
  }
}

