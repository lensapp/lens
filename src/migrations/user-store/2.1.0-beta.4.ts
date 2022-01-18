/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Add / reset "lastSeenAppVersion"
import type { MigrationDeclaration } from "../helpers";

export default {
  version: "2.1.0-beta.4",
  run(store) {
    store.set("lastSeenAppVersion", "0.0.0");
  },
} as MigrationDeclaration;
