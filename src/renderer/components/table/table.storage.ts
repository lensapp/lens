import { createStorage } from "../../utils";
import { TableSortParams } from "./table";

export interface TableStorageModel {
  sortParams: {
    [tableId: string]: Partial<TableSortParams>;
  }
}

export const tableStorage = createStorage<TableStorageModel>("table_settings", {
  sortParams: {}
});

export function getSortParams(tableId: string): Partial<TableSortParams> {
  return tableStorage.get().sortParams[tableId];
}

export function setSortParams(tableId: string, sortParams: Partial<TableSortParams>) {
  tableStorage.merge(draft => {
    draft.sortParams[tableId] = sortParams;
  });
}
