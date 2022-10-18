/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import path from "path";

const pathDelimiterInjectable = getInjectable({
  id: "path-delimiter",
  instantiate: () => path.delimiter,
  causesSideEffects: true,
});

export default pathDelimiterInjectable;
