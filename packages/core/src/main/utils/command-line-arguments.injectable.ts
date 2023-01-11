/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const commandLineArgumentsInjectable = getInjectable({
  id: "command-line-arguments",
  instantiate: () => process.argv,
  causesSideEffects: true,
});

export default commandLineArgumentsInjectable;
