/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "../electron-app/electron-app.injectable";

const buildVersionInjectable = getInjectable({
  id: "build-version",
  instantiate: (di) => di.inject(electronAppInjectable).getVersion(),
});

export default buildVersionInjectable;
