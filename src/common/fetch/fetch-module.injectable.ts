/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type * as FetchModule from "node-fetch";

const { NodeFetch } = require("../../../build/webpack/node-fetch.bundle") as { NodeFetch: typeof FetchModule };

/**
 * NOTE: while using this module can cause side effects, this specific injectable is not marked as
 * such since sometimes the request can be wholely within the perview of unit test
 */
const nodeFetchModuleInjectable = getInjectable({
  id: "node-fetch-module",
  instantiate: () => NodeFetch,
});

export default nodeFetchModuleInjectable;
