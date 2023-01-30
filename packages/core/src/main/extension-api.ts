/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { spawn } from "node-pty";

export * as Mobx from "mobx";
export * as MainApi from "../extensions/main-api";

export const Pty = {
  spawn,
};
