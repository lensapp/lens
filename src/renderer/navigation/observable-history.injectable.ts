/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";

import { navigation as observableHistory } from "./history";

const observableHistoryInjectable = getInjectable({
  instantiate: () => observableHistory,

  lifecycle: lifecycleEnum.singleton,
});

export default observableHistoryInjectable;
