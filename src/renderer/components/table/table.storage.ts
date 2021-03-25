import { createStorage } from "../../utils";

// TODO: move here `hiddenTableColumns` from user-store.ts
export interface TableStorageModel {
  columnSizes: {
    [tableId: string]: {
      [columnId: string]: number;
    }
  }
}

export const tableStorage = createStorage<TableStorageModel>("table_settings", {
  columnSizes: {},
});

export function getColumnSize(tableId: string, columnId: string): number | undefined {
  return tableStorage.get().columnSizes[tableId]?.[columnId];
}

export function setColumnSize(params: { tableId: string, columnId: string, size: number }) {
  const { tableId, columnId, size } = params;

  if (!tableId || !columnId) return;

  tableStorage.merge(draft => {
    draft.columnSizes[tableId] ??= {};
    draft.columnSizes[tableId][columnId] = size;
  });
}
