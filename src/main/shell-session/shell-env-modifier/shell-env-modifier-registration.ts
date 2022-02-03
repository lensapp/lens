/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export interface ShellEnvContext {
  context: string;
  kubeconfigPath: string;
  id: string;
}

export type ShellEnvModifier = (cluster: ShellEnvContext, env: Record<string, string | undefined>) => Record<string, string | undefined>;
