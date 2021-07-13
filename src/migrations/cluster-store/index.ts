/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
