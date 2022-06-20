/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

export type GetElementById = (id: string) => HTMLElement;

const getElementByIdInjectable = getInjectable({
  id: "get-element-by-id",
  instantiate: (): GetElementById => (id) => {
    const element = document.getElementById(id);

    if (!element) {
      throw new Error(`Failed to find element: ${id}`);
    }

    return element;
  },
  causesSideEffects: true,
});

export default getElementByIdInjectable;
