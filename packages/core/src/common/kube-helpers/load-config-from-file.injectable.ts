/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AsyncResult } from "@k8slens/utilities";
import type { KubeConfig } from "@kubernetes/client-node";
import { getInjectable } from "@ogre-tools/injectable";
import type { ZodError } from "zod";
import readFileInjectable from "../fs/read-file.injectable";
import { loadConfigFromString } from "../kube-helpers";
import resolveTildeInjectable from "../path/resolve-tilde.injectable";

export type LoadConfigFromFile = (filePath: string) => AsyncResult<KubeConfig, ZodError<unknown>>;

const loadConfigFromFileInjectable = getInjectable({
  id: "load-config-from-file",
  instantiate: (di): LoadConfigFromFile => {
    const readFile = di.inject(readFileInjectable);
    const resolveTilde = di.inject(resolveTildeInjectable);

    return async (filePath) => loadConfigFromString(await readFile(resolveTilde(filePath)));
  },
});

export default loadConfigFromFileInjectable;
