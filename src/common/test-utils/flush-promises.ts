/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { setImmediate } from "timers";

export const flushPromises = () => new Promise(setImmediate);
