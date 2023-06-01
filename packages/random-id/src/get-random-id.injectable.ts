/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import { v4 as getRandomId } from "uuid";

export type GetRandomId = () => string;
export const getRandomIdInjectionToken = getInjectionToken<GetRandomId>({
  id: "get-random-id-injection-token",
});

export const getRandomIdInjectable = getInjectable({
  id: "get-random-id",
  instantiate: (): GetRandomId => () => getRandomId(),
  causesSideEffects: true,
  injectionToken: getRandomIdInjectionToken,
});
