/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import userPreferencesStateInjectable from "./state.injectable";

/**
 * Checks if a column (by ID) for a table (by ID) is configured to be hidden
 * @param tableId The ID of the table to be checked against
 * @param columnIds The list of IDs the check if one is hidden
 * @returns true if at least one column under the table is set to hidden
 */
export type IsTableColumnHidden = (tableId: string, ...columnIds: (string | undefined)[]) => boolean;

const isTableColumnHiddenInjectable = getInjectable({
  id: "is-table-column-hidden",
  instantiate: (di): IsTableColumnHidden => {
    const state = di.inject(userPreferencesStateInjectable);

    return (tableId, ...columnIds) => {
      if (columnIds.length === 0) {
        return false;
      }

      const config = state.hiddenTableColumns.get(tableId);

      if (!config) {
        return false;
      }

      return columnIds.some(columnId => columnId && config.has(columnId));
    };
  },
});

export default isTableColumnHiddenInjectable;
