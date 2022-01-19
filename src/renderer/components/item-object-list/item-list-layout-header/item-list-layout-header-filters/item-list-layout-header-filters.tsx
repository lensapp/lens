/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { observer } from "mobx-react";
import React from "react";
import type { HeaderPlaceholders } from "../../item-list-layout";

interface ItemListLayoutHeaderFiltersProps {
  headerPlaceholders: HeaderPlaceholders
}

export const ItemListLayoutHeaderFilters = observer(
  ({ headerPlaceholders }: ItemListLayoutHeaderFiltersProps) => (
    <>{headerPlaceholders.filters}</>
  ),
);
