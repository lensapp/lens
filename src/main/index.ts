/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Main process

import { getDi } from "./getDi";
import startMainApplicationInjectable from "./start-main-application/start-main-application.injectable";
import { Mobx, LensExtensions, Pty } from "./extension-api";

const di = getDi();

void di.inject(startMainApplicationInjectable);

export { Mobx, LensExtensions, Pty };
