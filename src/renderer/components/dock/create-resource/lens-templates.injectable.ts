/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import path from "path";
import { hasCorrectExtension } from "./has-correct-extension";
import readFileInjectable from "../../../../common/fs/read-file.injectable";
import readDirInjectable from "../../../../common/fs/read-dir.injectable";
import type { RawTemplates } from "./create-resource-templates.injectable";
import staticFilesDirectoryInjectable from "../../../../common/vars/static-files-directory.injectable";
import joinPathsInjectable from "../../../../common/path/join-paths.injectable";

const lensCreateResourceTemplatesInjectable = getInjectable({
  id: "lens-create-resource-templates",

  instantiate: async (di): Promise<RawTemplates> => {
    const readFile = di.inject(readFileInjectable);
    const readDir = di.inject(readDirInjectable);
    const joinPaths = di.inject(joinPathsInjectable);
    const staticFilesDirectory = di.inject(staticFilesDirectoryInjectable);

    /**
     * Mapping between file names and their contents
     */
    const templates: [file: string, contents: string][] = [];
    const templatesFolder = joinPaths(staticFilesDirectory, "../templates/create-resource");

    for (const dirEntry of await readDir(templatesFolder)) {
      if (hasCorrectExtension(dirEntry)) {
        templates.push([path.parse(dirEntry).name, await readFile(path.join(templatesFolder, dirEntry))]);
      }
    }

    return ["lens", templates];
  },
});

export default lensCreateResourceTemplatesInjectable;
