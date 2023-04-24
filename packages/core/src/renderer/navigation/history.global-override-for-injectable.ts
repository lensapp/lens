/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { createMemoryHistory } from "history";
import { getGlobalOverride } from "@k8slens/test-utils";
import { observableHistoryInjectable } from "@k8slens/routing";

export default getGlobalOverride(observableHistoryInjectable, () => createMemoryHistory());
