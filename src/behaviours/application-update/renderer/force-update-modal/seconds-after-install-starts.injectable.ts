/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const secondsAfterInstallStartsInjectable = getInjectable({
  id: "seconds-after-install-starts",
  instantiate: () => 90,
});

export default secondsAfterInstallStartsInjectable;
