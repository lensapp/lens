/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { history } from "./history";

const historyInjectable = getInjectable({
  instantiate: () => history,
  lifecycle: lifecycleEnum.singleton,
});

export default historyInjectable;
