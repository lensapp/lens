/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sanitizeExtensionName } from "../../../../extensions/lens-extension";
import path from "path";
import localExtensionsDirectoryPathInjectable from "../../../../features/extensions/discovery/common/local-extensions-directory-path.injectable";

export type GetExtensionDestFolder = (name: string) => string;

const getExtensionDestFolderInjectable = getInjectable({
  id: "get-extension-dest-folder",

  instantiate: (di): GetExtensionDestFolder => {
    const localExtensionsDirectoryPath = di.inject(localExtensionsDirectoryPathInjectable);

    return (name) => path.join(localExtensionsDirectoryPath, sanitizeExtensionName(name));
  },
});

export default getExtensionDestFolderInjectable;
