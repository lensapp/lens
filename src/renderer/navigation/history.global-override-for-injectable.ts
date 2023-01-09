/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { createMemoryHistory } from "history";
import { getGlobalOverride } from "../../common/test-utils/get-global-override";
import historyInjectable from "./history.injectable";

export default getGlobalOverride(historyInjectable, () => createMemoryHistory());
