/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import appVersionInjectable from "../../common/get-configuration-file-model/app-version/app-version.injectable";
import { appPublishDate } from "./app-publish-date";

const appPublishDateInjectable = getInjectable({
  id: "app-publish-date",

  instantiate: (di) => {
    return appPublishDate(di.inject(appVersionInjectable));
  },
});

export default appPublishDateInjectable;
