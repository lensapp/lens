/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const rootElementInjectable = getInjectable({
  id: "root-element",
  instantiate: () => {
    const rootElement = document.createElement("div");

    rootElement.id = "app";

    document.getElementsByTagName("body")[0].append(rootElement);

    return rootElement;
  },
});

export default rootElementInjectable;
