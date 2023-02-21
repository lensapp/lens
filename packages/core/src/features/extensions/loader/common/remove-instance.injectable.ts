/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import extensionInstancesInjectable from "../../../../extensions/extension-loader/extension-instances.injectable";
import extensionInjectable from "../../../../extensions/extension-loader/extension/extension.injectable";
import type { LensExtensionId } from "../../common/installed-extension";
import extensionLoadingLoggerInjectable from "./logger.injectable";
import extensionsWithoutInstancesByNameInjectable from "./non-instances-by-name.injectable";

export type RemoveExtensionInstance = (id: LensExtensionId) => void;

const removeExtensionInstanceInjectable = getInjectable({
  id: "remove-extension-instance",
  instantiate: (di): RemoveExtensionInstance => {
    const logger = di.inject(extensionLoadingLoggerInjectable);
    const extensionInstances = di.inject(extensionInstancesInjectable);
    const extensionsWithoutInstancesByName = di.inject(extensionsWithoutInstancesByNameInjectable);

    return action((id) => {
      logger.info(`deleting extension instance ${id}`);
      const instance = extensionInstances.get(id);

      if (!instance) {
        return;
      }

      try {
        instance.disable();
        di.inject(extensionInjectable, instance).deregister();
        extensionInstances.delete(id);
        extensionsWithoutInstancesByName.delete(instance.name);
      } catch (error) {
        logger.error(`deactivation extension error`, { id, error });
      }
    });
  },
});

export default removeExtensionInstanceInjectable;
