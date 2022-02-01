/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { ObservableSet } from "mobx";
import type { LensLogger } from "../../../common/logger";
import installationStateLoggerInjectable from "../../../extensions/installation-state/logger.injectable";
import { InstallationState } from "../../../extensions/installation-state/state";
import getInstallationStateInjectable from "./get-installation-state.injectable";
import extensionsUninstallingInjectable from "./uninstalling.injectable";

interface Dependencies {
  logger: LensLogger;
  getInstallationState: (extId: string) => InstallationState;
  state: ObservableSet<string>;
}

const clearUninstalling = ({ logger, getInstallationState, state }: Dependencies)=> (
  (extId: string): void =>  {
    logger.debug(`trying to clear ${extId} as uninstalling`);

    const curState = getInstallationState(extId);

    switch (curState) {
      case InstallationState.UNINSTALLING:
        return void state.delete(extId);
      default:
        throw new Error(`cannot clear UNINSTALLING state for ${extId}, it is currently ${curState}`);
    }
  }
);

/**
 * Strictly clears the UNINSTALLING state of an extension
 * @param extId The ID of the extension
 * @throws if state is not UNINSTALLING
 */
const clearUninstallingInjectable = getInjectable({
  instantiate: (di) => clearUninstalling({
    getInstallationState: di.inject(getInstallationStateInjectable),
    logger: di.inject(installationStateLoggerInjectable),
    state: di.inject(extensionsUninstallingInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default clearUninstallingInjectable;
