/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getSyncEntryInjectable from "./get-entry.injectable";
import type { SyncValue } from "./view";

export type GetAllSyncEntries = (filePaths: string[]) => Promise<[string, SyncValue][]>;

const getAllSyncEntriesInjectable = getInjectable({
  id: "get-all-sync-entries",
  instantiate: (di): GetAllSyncEntries => {
    const getSyncEntry = di.inject(getSyncEntryInjectable);

    return (filePaths) => Promise.all(filePaths.map(filePath => getSyncEntry({ filePath })));
  },
});

export default getAllSyncEntriesInjectable;
