/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { createTempFilesAndValidate } from "./create-temp-files-and-validate";
import extensionDiscoveryInjectable from "../../../../../extensions/extension-discovery/extension-discovery.injectable";

const createTempFilesAndValidateInjectable = getInjectable({
  id: "create-temp-files-and-validate",

  instantiate: (di) =>
    createTempFilesAndValidate({
      extensionDiscovery: di.inject(extensionDiscoveryInjectable),
    }),
});

export default createTempFilesAndValidateInjectable;
