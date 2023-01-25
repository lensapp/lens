/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { RequestInit, Response } from "@k8slens/node-fetch";
import fetch from "@k8slens/node-fetch";

export type Fetch = (url: string, init?: RequestInit) => Promise<Response>;

const fetchInjectable = getInjectable({
  id: "fetch",
  instantiate: () => fetch as Fetch,
  causesSideEffects: true,
});

export default fetchInjectable;
