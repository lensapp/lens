/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed, observable } from "mobx";
import { delay, getOrInsert, isErrnoException } from "@k8slens/utilities";
import { readFile } from "fs/promises";
import { hasCorrectExtension } from "./has-correct-extension";
import type { RawTemplate, RawTemplates } from "./create-resource-templates.injectable";
import joinPathsInjectable from "../../../../common/path/join-paths.injectable";
import watchInjectable from "../../../../common/fs/watch/watch.injectable";
import getRelativePathInjectable from "../../../../common/path/get-relative-path.injectable";
import homeDirectoryPathInjectable from "../../../../common/os/home-directory-path.injectable";
import getDirnameOfPathInjectable from "../../../../common/path/get-dirname.injectable";
import parsePathInjectable from "../../../../common/path/parse.injectable";
import { waitForPath } from "../../../../common/utils/wait-for-path";
import { prefixedLoggerInjectable } from "@k8slens/logger";

const userCreateResourceTemplatesInjectable = getInjectable({
  id: "user-create-resource-templates",
  instantiate: (di) => {
    const joinPaths = di.inject(joinPathsInjectable);
    const watch = di.inject(watchInjectable);
    const getRelativePath = di.inject(getRelativePathInjectable);
    const homeDirectoryPath = di.inject(homeDirectoryPathInjectable);
    const getDirnameOfPath = di.inject(getDirnameOfPathInjectable);
    const logger = di.inject(prefixedLoggerInjectable, "USER-CREATE-RESOURCE-TEMPLATES");
    const parsePath = di.inject(parsePathInjectable);

    const userTemplatesFolder = joinPaths(homeDirectoryPath, ".k8slens", "templates");
    const groupTemplates = (templates: Map<string, string>): RawTemplates[] => {
      const res = new Map<string, RawTemplate[]>();

      for (const [filePath, value] of templates) {
        const rawRelative = getDirnameOfPath(getRelativePath(userTemplatesFolder, filePath));
        const title = rawRelative === "."
          ? "ungrouped"
          : rawRelative;

        getOrInsert(res, title, []).push({
          label: parsePath(filePath).name,
          value,
        });
      }

      return Array.from(res.entries(), ([label, options]) => ({
        label,
        options,
      }));
    };

    /**
     * Map between filePaths and template contents
     */
    const templates = observable.map<string, string>();

    const onAddOrChange = async (filePath: string) => {
      if (!hasCorrectExtension(filePath)) {
        // ignore non yaml or json files
        return;
      }

      try {
        const contents = await readFile(filePath, "utf-8");

        templates.set(filePath, contents);
      } catch (error) {
        if (isErrnoException(error) && error.code === "ENOENT") {
        // ignore, file disappeared
        } else {
          logger.warn(`encountered error while reading ${filePath}`, error);
        }
      }
    };
    const onUnlink = (filePath: string) => {
      templates.delete(filePath);
    };

    (async () => {
      for (let i = 1;; i *= 2) {
        try {
          await waitForPath(userTemplatesFolder);
          break;
        } catch (error) {
          logger.warn(`encountered error while waiting for ${userTemplatesFolder} to exist, waiting and trying again`, error);
          await delay(i * 1000); // exponential backoff in seconds
        }
      }

      /**
       * NOTE: There is technically a race condition here of the form "time-of-check to time-of-use"
       */
      watch(userTemplatesFolder, {
        disableGlobbing: true,
        ignorePermissionErrors: true,
        usePolling: false,
        awaitWriteFinish: {
          pollInterval: 100,
          stabilityThreshold: 1000,
        },
        ignoreInitial: false,
        atomic: 150, // for "atomic writes"
      })
        .on("add", onAddOrChange)
        .on("change", onAddOrChange)
        .on("unlink", onUnlink)
        .on("error", error => {
          logger.warn(`encountered error while watching files under ${userTemplatesFolder}`, error);
        });
    })();

    return computed(() => groupTemplates(templates));
  },
});

export default userCreateResourceTemplatesInjectable;
