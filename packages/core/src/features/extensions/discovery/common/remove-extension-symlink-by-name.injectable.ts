/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import removePathInjectable from "../../../../common/fs/remove.injectable";
import getExtensionInstallPathInjectable from "../main/get-extension-install-path.injectable";

/**
 * Remove the symlink under node_modules if exists.
 * If we don't remove the symlink, the uninstall would leave a non-working symlink,
 * which wouldn't be fixed if the extension was reinstalled, causing the extension not to work.
 * @param name e.g. "@mirantis/lens-extension-cc"
 */
export type RemoveExtensionSymlinkByName = (name: string) => Promise<void>;

const removeExtensionSymlinkByNameInjectable = getInjectable({
  id: "remove-extension-symlink-by-name",
  instantiate: (di): RemoveExtensionSymlinkByName => {
    const removePath = di.inject(removePathInjectable);
    const getExtensionInstallPath = di.inject(getExtensionInstallPathInjectable);

    return (name) => removePath(getExtensionInstallPath(name));
  },
});

export default removeExtensionSymlinkByNameInjectable;
