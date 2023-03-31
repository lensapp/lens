/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

export type ShellSessionEnvs = Map<string, Record<string, string | undefined>>;

const shellSessionEnvsInjectable = getInjectable({
  id: "shell-session-envs",
  instantiate: (): ShellSessionEnvs => new Map(),
});

export default shellSessionEnvsInjectable;
