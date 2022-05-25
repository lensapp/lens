/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";

const appPublishDateInjectable = getInjectable({
  id: "app-publish-date",

  instantiate: () => {
    return "Wed, 04 May 2022 02:35:00 +0300";
  },
});

export default appPublishDateInjectable;
