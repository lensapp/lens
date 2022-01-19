/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Cluster store migrations

import { joinMigrations } from "../helpers";

import version360Beta1 from "./3.6.0-beta.1";
import version500Beta10 from "./5.0.0-beta.10";
import version500Beta13 from "./5.0.0-beta.13";
import snap from "./snap";

export default joinMigrations(
  version360Beta1,
  version500Beta10,
  version500Beta13,
  snap,
);
