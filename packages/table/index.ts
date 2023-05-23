import { getInjectionToken } from "@ogre-tools/injectable";
import type { KubeObject } from "@k8slens/kube-object/src/kube-object";
import type {
  BaseKubeObjectListLayoutColumn,
  GeneralKubeObjectListLayoutColumn,
  SpecificKubeListLayoutColumn,
} from "@k8slens/list-layout/src/kube-list-layout-column";
import React from "react";

type Column = (
  | BaseKubeObjectListLayoutColumn<KubeObject>
  | SpecificKubeListLayoutColumn<KubeObject>
  | GeneralKubeObjectListLayoutColumn
);

export interface TableComponentProps {
  tableId?: string;
  columns?: Column[];
  save?: (state: object) => void;
  load?: (tableId: string) => object;
}

export interface TableDataContextValue {
  columns?: Column[];
}

export const TableDataContext = React.createContext<TableDataContextValue>({
  columns: [],
});

export interface TableComponent {
  Component: React.ComponentType<TableComponentProps>;
}

export const tableComponentInjectionToken = getInjectionToken<TableComponent>({
  id: "table-component-injection-token",
});
