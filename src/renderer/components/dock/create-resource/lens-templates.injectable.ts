/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { hasCorrectExtension } from "./has-correct-extension";
import readFileInjectable from "../../../../common/fs/read-file.injectable";
import readDirectoryInjectable from "../../../../common/fs/read-directory.injectable";
import type { RawTemplates } from "./create-resource-templates.injectable";
import staticFilesDirectoryInjectable from "../../../../common/vars/static-files-directory.injectable";
import joinPathsInjectable from "../../../../common/path/join-paths.injectable";
import parsePathInjectable from "../../../../common/path/parse.injectable";

const lensCreateResourceTemplatesInjectable = getInjectable({
  id: "lens-create-resource-templates",

  instantiate: async (di): Promise<RawTemplates> => {
    const readFile = di.inject(readFileInjectable);
    const readDir = di.inject(readDirectoryInjectable);
    const joinPaths = di.inject(joinPathsInjectable);
    const staticFilesDirectory = di.inject(staticFilesDirectoryInjectable);
    const parsePath = di.inject(parsePathInjectable);

    /**
     * Mapping between file names and their contents
     */
    const templates: [file: string, contents: string][] = [];
    const templatesFolder = joinPaths(staticFilesDirectory, "../templates/create-resource");

    for (const dirEntry of await readDir(templatesFolder)) {
      if (hasCorrectExtension(dirEntry)) {
        templates.push([parsePath(dirEntry).name, await readFile(joinPaths(templatesFolder, dirEntry))]);
      }
    }

    return ["lens", templates];
  },
});

export default lensCreateResourceTemplatesInjectable;
