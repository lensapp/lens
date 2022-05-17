/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { computed, observable } from "mobx";
import path from "path";
import os from "os";
import { delay, getOrInsert, isErrnoException, waitForPath } from "../../../utils";
import { watch } from "chokidar";
import { readFile } from "fs/promises";
import logger from "../../../../common/logger";
import { hasCorrectExtension } from "./has-correct-extension";
import type { RawTemplates } from "./create-resource-templates.injectable";

const userTemplatesFolder = path.join(os.homedir(), ".k8slens", "templates");

function groupTemplates(templates: Map<string, string>): RawTemplates[] {
  const res = new Map<string, [string, string][]>();

  for (const [filePath, contents] of templates) {
    const rawRelative = path.dirname(path.relative(userTemplatesFolder, filePath));
    const title = rawRelative === "."
      ? "ungrouped"
      : rawRelative;

    getOrInsert(res, title, []).push([path.parse(filePath).name, contents]);
  }

  return [...res.entries()];
}

function watchUserCreateResourceTemplates(): IComputedValue<RawTemplates[]> {
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
        logger.warn(`[USER-CREATE-RESOURCE-TEMPLATES]: encountered error while reading ${filePath}`, error);
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
        logger.warn(`[USER-CREATE-RESOURCE-TEMPLATES]: encountered error while waiting for ${userTemplatesFolder} to exist, waiting and trying again`, error);
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
        logger.warn(`[USER-CREATE-RESOURCE-TEMPLATES]: encountered error while watching files under ${userTemplatesFolder}`, error);
      });
  })();

  return computed(() => groupTemplates(templates));
}

const userCreateResourceTemplatesInjectable = getInjectable({
  id: "user-create-resource-templates",
  instantiate: () => watchUserCreateResourceTemplates(),
});

export default userCreateResourceTemplatesInjectable;
