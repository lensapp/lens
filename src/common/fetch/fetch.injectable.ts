/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { RequestInfo, RequestInit, Response } from "node-fetch";
import fetch from "node-fetch";

export type Fetch = (url: RequestInfo, init?: RequestInit) => Promise<Response>;

const fetchInjectable = getInjectable({
  id: "fetch",
  instantiate: (): Fetch => fetch,
  causesSideEffects: true,
});

export default fetchInjectable;
