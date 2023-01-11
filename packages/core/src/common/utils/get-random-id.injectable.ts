/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { v4 as getRandomId } from "uuid";

const getRandomIdInjectable = getInjectable({
  id: "get-random-id",
  instantiate: () => () => getRandomId(),
  causesSideEffects: true,
});

export default getRandomIdInjectable;
