/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { CatalogEntity } from "../../../common/catalog";

export interface ShellEnvContext {
  catalogEntity: CatalogEntity;
}

export type ShellEnvModifier = (ctx: ShellEnvContext, env: Record<string, string | undefined>) => Record<string, string | undefined>;
