/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import readFileInjectable from "../fs/read-file.injectable";
import type { ConfigResult } from "../kube-helpers";
import { loadConfigFromString } from "../kube-helpers";
import resolveTildeInjectable from "../path/resolve-tilde.injectable";

export type LoadConfigFromFile = (filePath: string) => Promise<ConfigResult>;

const loadConfigFromFileInjectable = getInjectable({
  id: "load-config-from-file",
  instantiate: (di): LoadConfigFromFile => {
    const readFile = di.inject(readFileInjectable);
    const resolveTilde = di.inject(resolveTildeInjectable);

    return async (filePath) => loadConfigFromString(await readFile(resolveTilde(filePath)));
  },
});

export default loadConfigFromFileInjectable;
