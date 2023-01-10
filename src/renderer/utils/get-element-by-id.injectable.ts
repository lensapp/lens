/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const getElementByIdInjectable = getInjectable({
  id: "get-element-by-id",
  instantiate: () => (id: string) => {
    const elem = document.getElementById(id);

    if (!elem) {
      throw new Error(`Missing #${id} in DOM`);
    }

    return elem;
  },
  causesSideEffects: true,
});

export default getElementByIdInjectable;
