/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getGlobalOverrideForFunction } from "@k8slens/test-utils";
import logErrorInjectable from "./log-error.injectable";

// Note: this should remain as it is, and throw if called. Logging error is something
// that cannot happen without a unit test explicitly causing it. It cannot be allowed
// to happen without author of unit test knowing it.
export default getGlobalOverrideForFunction(logErrorInjectable);
