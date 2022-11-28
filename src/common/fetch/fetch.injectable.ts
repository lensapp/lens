/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type * as FetchModule from "node-fetch";

const { NodeFetch: { default: fetch }} = require("../../../build/webpack/node-fetch.bundle") as { NodeFetch: typeof FetchModule };

type Response = FetchModule.Response;
type RequestInit = FetchModule.RequestInit;

export type Fetch = (url: string, init?: RequestInit) => Promise<Response>;

const fetchInjectable = getInjectable({
  id: "fetch",
  instantiate: (): Fetch => fetch,
  causesSideEffects: true,
});

export default fetchInjectable;
