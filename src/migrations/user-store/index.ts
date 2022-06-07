/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// User store migrations

import { joinMigrations } from "../helpers";

import version210Beta4 from "./2.1.0-beta.4";
import version500Alpha3 from "./5.0.0-alpha.3";
import version503Beta1 from "./5.0.3-beta.1";

export default joinMigrations(
  version210Beta4,
  version500Alpha3,
  version503Beta1,
);
