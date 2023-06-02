/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { KubeObject } from "@k8slens/kube-object";
import type {
  BaseKubeObjectListLayoutColumn,
  GeneralKubeObjectListLayoutColumn,
  SpecificKubeListLayoutColumn,
} from "@k8slens/list-layout";
import type { ItemListLayoutContentProps } from "../item-object-list/content";

export type TableContextRequiredDataFromComponentsLayerAbove<
  K extends KubeObject
> = Pick<
  ItemListLayoutContentProps<K, any>,
  | "tableId"
  | "getFilters"
  | "renderItemMenu"
  | "store"
  | "onDetails"
  | "hasDetailsView"
  | "getItems"
  | "renderTableHeader"
  | "renderTableContents"
  | "sortingCallbacks"
  | "isSelectable"
>;

export interface TableDataContextValue<K extends KubeObject>
  extends TableContextRequiredDataFromComponentsLayerAbove<K> {
  columns?: (
    | BaseKubeObjectListLayoutColumn<K>
    | SpecificKubeListLayoutColumn<K>
    | GeneralKubeObjectListLayoutColumn
  )[];
}

export const TableDataContext = React.createContext<
  TableDataContextValue<KubeObject>
>({} as any);