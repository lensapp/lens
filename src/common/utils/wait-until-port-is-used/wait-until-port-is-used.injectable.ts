/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { waitUntilUsed } from "tcp-port-used";

export type WaitUntilPortIsUsed = (
  port: number,
  retryAfterMs: number,
  timeoutAfterMs: number
) => Promise<void>;

const waitUntilPortIsUsedInjectable = getInjectable({
  id: "wait-until-port-is-used",
  instantiate: (): WaitUntilPortIsUsed => waitUntilUsed,
  causesSideEffects: true,
});

export default waitUntilPortIsUsedInjectable;
