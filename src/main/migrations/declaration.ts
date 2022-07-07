/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type Conf from "conf";

export interface MigrationDeclaration {
  version: string;
  run(store: Conf<Record<string, unknown>>): void;
}
