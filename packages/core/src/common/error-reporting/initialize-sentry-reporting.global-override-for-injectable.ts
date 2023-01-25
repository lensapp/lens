/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../test-utils/get-global-override";
import initializeSentryReportingWithInjectable from "./initialize-sentry-reporting.injectable";

export default getGlobalOverride(initializeSentryReportingWithInjectable, () => () => {});
