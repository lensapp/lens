/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import navigateToCatalogInjectable from "./routes/catalog/navigate-to-catalog.injectable";

const navigateToFrontPageInjectable = getInjectable({
  id: "navigate-to-front-page",
  instantiate: (di) => di.inject(navigateToCatalogInjectable),
});

export default navigateToFrontPageInjectable;
