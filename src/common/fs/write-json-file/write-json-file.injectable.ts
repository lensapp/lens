/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { writeJsonFile } from "./write-json-file";
import fsInjectable from "../fs.injectable";

const writeJsonFileInjectable = getInjectable({
  instantiate: (di) => writeJsonFile({ fs: di.inject(fsInjectable) }),
  lifecycle: lifecycleEnum.singleton,
});

export default writeJsonFileInjectable;
