/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fetch from "@k8slens/node-fetch";

export type Fetch = typeof fetch;

const fetchInjectable = getInjectable({
  id: "fetch",
  instantiate: () => fetch,
  causesSideEffects: true,
});

export default fetchInjectable;
