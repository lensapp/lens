/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import readFileInjectable from "./read-file.injectable";
import yaml from "js-yaml";

export type ReadYamlFile = (filePath: string) => Promise<unknown>;

const readYamlFileInjectable = getInjectable({
  id: "read-yaml-file",

  instantiate: (di): ReadYamlFile => {
    const readFile = di.inject(readFileInjectable);

    return async (filePath: string) => {
      const contents = await readFile(filePath);

      return yaml.load(contents);
    };
  },
});

export default readYamlFileInjectable;
