/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import path from "path";
import { readdir, readFile } from "fs/promises";
import { hasCorrectExtension } from "./has-correct-extension";
import type { RawTemplates } from "./create-resource-templates.injectable";

const templatesFolder = path.resolve(__static, "../templates/create-resource");

async function getTemplates() {
  /**
   * Mapping between file names and their contents
   */
  const templates: [file: string, contents: string][] = [];

  for (const dirEntry of await readdir(templatesFolder)) {
    if (hasCorrectExtension(dirEntry)) {
      templates.push([path.parse(dirEntry).name, await readFile(path.join(templatesFolder, dirEntry), "utf-8")]);
    }
  }

  return templates;
}

let lensTemplatePaths: RawTemplates;

const lensCreateResourceTemplatesInjectable = getInjectable({
  setup: async () => {
    lensTemplatePaths = ["lens", await getTemplates()];
  },
  instantiate: () => lensTemplatePaths,
  lifecycle: lifecycleEnum.singleton,
});

export default lensCreateResourceTemplatesInjectable;
