import { ClusterId } from "./cluster-store";

export type TableId = string;
export type TableSizeRecord = Record<TableId, number[]>;

/**
 * Stores a configuration of table column sizes, set by the user,
 * for each table by `TableId`, for each cluster by `ClusterId`
 */
export type TableSizeConfig = Record<ClusterId, TableSizeRecord>;
