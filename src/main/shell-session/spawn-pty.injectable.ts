/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IPty, IPtyForkOptions, IWindowsPtyForkOptions } from "node-pty";
import { spawn } from "node-pty";

export type WindowsSpawnPtyOptions = Omit<IWindowsPtyForkOptions, "env"> & { env?: Partial<Record<string, string>> };
export type UnixSpawnPtyOptions = Omit<IPtyForkOptions, "env"> & { env?: Partial<Record<string, string>> };
export type SpawnPtyOptions = UnixSpawnPtyOptions | WindowsSpawnPtyOptions;

export type SpawnPty = (file: string, args: string[], options: SpawnPtyOptions) => IPty;

const spawnPtyInjectable = getInjectable({
  id: "spawn-pty",
  instantiate: () => spawn as SpawnPty,
  causesSideEffects: true,
});

export default spawnPtyInjectable;
