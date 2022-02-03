/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { noop } from "../../../common/utils";

export interface ShellEnvClusterData {
  context: string;
  kubeconfigPath: string;
  id: string;
}

export type ShellEnvModifier = ((cluster: ShellEnvClusterData, env: Record<string, string | undefined>) => Record<string, string | undefined>) | typeof noop;
