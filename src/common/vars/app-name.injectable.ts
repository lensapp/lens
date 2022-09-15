/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import isDevelopmentInjectable from "./is-development.injectable";
import productNameInjectable from "./product-name.injectable";

const appNameInjectable = getInjectable({
  id: "app-name",

  instantiate: (di) => {
    const isDevelopment = di.inject(isDevelopmentInjectable);
    const productName = di.inject(productNameInjectable);

    return `${productName}${isDevelopment ? "Dev" : ""}`;
  },
});

export default appNameInjectable;
