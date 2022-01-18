/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Cluster store migrations

import { joinMigrations } from "../helpers";

import version200Beta2 from "./2.0.0-beta.2";
import version241 from "./2.4.1";
import version260Beta2 from "./2.6.0-beta.2";
import version260Beta3 from "./2.6.0-beta.3";
import version270Beta0 from "./2.7.0-beta.0";
import version270Beta1 from "./2.7.0-beta.1";
import version360Beta1 from "./3.6.0-beta.1";
import version500Beta10 from "./5.0.0-beta.10";
import version500Beta13 from "./5.0.0-beta.13";
import snap from "./snap";

export default joinMigrations(
  version200Beta2,
  version241,
  version260Beta2,
  version260Beta3,
  version270Beta0,
  version270Beta1,
  version360Beta1,
  version500Beta10,
  version500Beta13,
  snap,
);
