/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ReactNode } from "react";
import type { SearchFilter } from "../item-object-list/list-layout";
import type { TableCellProps, TableSortCallback } from "../table";
import type { ItemObject } from "../../../common/item.store";
import { getInjectionToken } from "@ogre-tools/injectable";

export interface KubeObjectListLayoutColumn<Item extends ItemObject> {
  id: string;
  kind: string;
  apiVersion: string;
  priority: number;
  sortingCallBack?: TableSortCallback<Item>;
  searchFilter?: SearchFilter<Item>;
  header: (TableCellProps | undefined | null);
  content: (item: Item) => (ReactNode | TableCellProps);
}

export const kubeObjectListLayoutColumnInjectionToken = getInjectionToken<KubeObjectListLayoutColumn<any>>({
  id: "kube-object-list-layout-column",
});
