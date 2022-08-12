/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { fetchImplInjectionToken } from "../../common/fetch/fetch.injectable";
import type * as FetchModule from "node-fetch";

const importFetchModule = new Function("return import('/bundles/node-fetch.bundle.js')") as () => Promise<typeof FetchModule>;

const fetchImplInjectable = getInjectable({
  id: "fetch-impl",
  instantiate: () => importFetchModule(),
  injectionToken: fetchImplInjectionToken,
  causesSideEffects: true,
});

export default fetchImplInjectable;
