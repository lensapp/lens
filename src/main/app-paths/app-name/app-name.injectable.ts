/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import packageInfo from "../../../../package.json";
import isDevelopmentInjectable from "../../../common/vars/is-development.injectable";

const appNameInjectable = getInjectable({
  id: "app-name",

  instantiate: (di) => {
    const isDevelopment = di.inject(isDevelopmentInjectable);

    return `${packageInfo.productName}${isDevelopment ? "Dev" : ""}`;
  },

  causesSideEffects: true,
});

export default appNameInjectable;
