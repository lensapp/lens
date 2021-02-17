import { ClusterId } from "./cluster-store";

/**
 * Stores a configuration of table column sizes, set by the user,
 * for each talbe by `tableId`
 */
export type TableSizeRecord = Record<string, number[]>;

/**
 * Stores a configuration of table column sizes, set by the user,
 * for each table by `tableId`, for each cluster by `ClusterId`
 */
export type TableSizeConfig = Record<ClusterId, TableSizeRecord>;
