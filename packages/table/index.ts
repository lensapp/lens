/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObject } from "@k8slens/kube-object";
import type {
  BaseKubeObjectListLayoutColumn,
  GeneralKubeObjectListLayoutColumn,
  SpecificKubeListLayoutColumn,
} from "@k8slens/list-layout";
import { getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue, IObservableValue } from "mobx";

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
  initialState?: {
    dataItems: IComputedValue<any[]>;
    headingColumns: object[];
    customizeRows?: (row: object) => object;
    getRowId?: (dataItem: any) => string | number | symbol;
    searchBox?: IComputedValue<string> | IObservableValue<string>;
  }
}

export interface TableComponent {
  Component: React.ComponentType<TableComponentProps>;
}

export interface AddRemoveButtonsProps extends React.HTMLAttributes<any> {
  onAdd?: () => void;
  onRemove?: () => void;
  addTooltip?: React.ReactNode;
  removeTooltip?: React.ReactNode;
}

export interface AddOrRemoveButtons {
  Component: React.ComponentType<AddRemoveButtonsProps>;
}

export const tableComponentInjectionToken = getInjectionToken<TableComponent>({
  id: "table-component-injection-token",
});

export const addOrRemoveButtonsInjectionToken = getInjectionToken<AddOrRemoveButtons>({
  id: "add-or-remove-buttons-injection-token",
});