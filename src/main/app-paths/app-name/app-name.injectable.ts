/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { isDevelopment } from "../../../common/vars";
import packageInfo from "../../../../package.json";

const appNameInjectable = getInjectable({
  id: "app-name",
  instantiate: () => `${packageInfo.productName}${isDevelopment ? "Dev" : ""}`,
  causesSideEffects: true,
});

export default appNameInjectable;
