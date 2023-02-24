/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import isMacInjectable from "../../common/vars/is-mac.injectable";

const rootElementInjectable = getInjectable({
  id: "root-element",
  instantiate: (di) => {
    const isMac = di.inject(isMacInjectable);

    const rootElement = document.createElement("div");

    rootElement.id = "app";
    rootElement.classList.toggle("is-mac", isMac);

    document.getElementsByTagName("body")[0].append(rootElement);

    return rootElement;
  },
});

export default rootElementInjectable;
