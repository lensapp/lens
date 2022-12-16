/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { RequestInit, Response } from "node-fetch";
import nodeFetchModuleInjectable from "./fetch-module.injectable";

export type Fetch = (url: string, init?: RequestInit) => Promise<Response>;

const fetchInjectable = getInjectable({
  id: "fetch",
  instantiate: (di): Fetch => {
    const { default: fetch } = di.inject(nodeFetchModuleInjectable);

    return (url, init) => fetch(url, init);
  },
  causesSideEffects: true,
});

export default fetchInjectable;
