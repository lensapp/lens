import React from "react";
import { getInjectionToken } from "@ogre-tools/injectable";
import type { KubeObject } from "@k8slens/kube-object/src/kube-object";
import type {
  BaseKubeObjectListLayoutColumn,
  GeneralKubeObjectListLayoutColumn,
  SpecificKubeListLayoutColumn,
} from "@k8slens/list-layout/src/kube-list-layout-column";

export interface TableDataContextValue {
  columns?: (
    | BaseKubeObjectListLayoutColumn<KubeObject>
    | SpecificKubeListLayoutColumn<KubeObject>
    | GeneralKubeObjectListLayoutColumn
  )[];
}

export const TableDataContext = React.createContext<TableDataContextValue>({
  columns: [],
});

export type CreateTableState<Props> = (context: TableDataContextValue, props: Props) => any;

export const createTableStateInjectionToken = getInjectionToken<CreateTableState<any>>({
  id: "create-table-state-injection-token",
});

export const tableComponentInjectionToken = getInjectionToken<React.ComponentType<any>>({
  id: "table-component-injection-token",
});
