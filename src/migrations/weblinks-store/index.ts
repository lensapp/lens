/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { joinMigrations } from "../helpers";

import version514 from "./5.1.4";
import version545Beta1 from "./5.4.5-beta.1";
import currentVersion from "./currentVersion";

export default joinMigrations(
  version514,
  version545Beta1,
  currentVersion,
);
