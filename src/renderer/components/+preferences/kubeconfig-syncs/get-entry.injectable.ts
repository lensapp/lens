/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import statInjectable from "../../../../common/fs/stat.injectable";
import type { KubeconfigSyncEntry } from "../../../../common/user-store";
import kubeconfigSyncsPreferencesLoggerInjectable from "./logger.injectable";
import type { SyncValue } from "./view";

export type GetSyncEntry = ({ filePath, ...data }: KubeconfigSyncEntry) => Promise<[string, SyncValue]>;

const getSyncEntryInjectable = getInjectable({
  id: "get-sync-entry",
  instantiate: (di): GetSyncEntry => {
    const logger = di.inject(kubeconfigSyncsPreferencesLoggerInjectable);
    const stat = di.inject(statInjectable);

    return async ({ filePath, ...data }) => {
      try {
        // stat follows the stat(2) linux syscall spec, namely it follows symlinks
        const stats = await stat(filePath);

        if (stats.isFile()) {
          return [filePath, { info: { type: "file" }, data }];
        }

        if (stats.isDirectory()) {
          return [filePath, { info: { type: "folder" }, data }];
        }

        logger.warn("unknown stat entry", { stats });

        return [filePath, { info: { type: "unknown" }, data }];
      } catch (error) {
        logger.warn("failed to stat entry", { error });

        return [filePath, { info: { type: "unknown" }, data }];
      }
    };
  },
});

export default getSyncEntryInjectable;
