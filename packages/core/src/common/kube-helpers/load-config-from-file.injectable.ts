/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import readFileInjectable from "../fs/read-file.injectable";
import type { ConfigResult } from "../kube-helpers";
import { loadConfigFromString } from "../kube-helpers";
import resolveTildeInjectable from "../path/resolve-tilde.injectable";

export type LoadConfigfromFile = (filePath: string) => Promise<ConfigResult>;

const loadConfigfromFileInjectable = getInjectable({
  id: "load-configfrom-file",
  instantiate: (di): LoadConfigfromFile => {
    const readFile = di.inject(readFileInjectable);
    const resolveTilde = di.inject(resolveTildeInjectable);

    return async (filePath) => loadConfigFromString(await readFile(resolveTilde(filePath)));
  },
});

export default loadConfigfromFileInjectable;
