/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import installationStateLoggerInjectable from "../../../extensions/installation-state/logger.injectable";
import { ClearInstalling, clearInstallingChannel, clearInstallingChannelInjectionToken } from "../../../extensions/installation-state/state-channels";
import registerEventSinkInjectable from "../../../common/communication/register-event-sink.injectable";
import type { ObservableSet } from "mobx";
import type { LensLogger } from "../../../common/logger";
import { InstallationState } from "../../../extensions/installation-state/state";
import getInstallationStateInjectable from "./get-installation-state.injectable";
import extensionsInstallingInjectable from "./installing.injectable";

interface Dependencies {
  logger: LensLogger;
  getInstallationState: (extId: string) => InstallationState;
  state: ObservableSet<string>;
}

const nonInjectedClearInstalling = ({ logger, getInstallationState, state }: Dependencies) => (
  (extId: string): void =>  {
    logger.debug(`trying to clear ${extId} as installing`);

    const curState = getInstallationState(extId);

    switch (curState) {
      case InstallationState.INSTALLING:
        return void state.delete(extId);
      default:
        throw new Error(`cannot clear INSTALLING state for ${extId}, it is currently ${curState}`);
    }
  }
);

let channel: ClearInstalling;

/**
 * Strictly clears the INSTALLING state of an extension
 * @param extId The ID of the extension
 * @throws if state is not INSTALLING
 */
const clearInstallingChannelInjectable = getInjectable({
  setup: (di) => {
    const registerEventSink = di.inject(registerEventSinkInjectable);
    const logger = di.inject(installationStateLoggerInjectable);
    const clearInstalling = nonInjectedClearInstalling({
      getInstallationState: di.inject(getInstallationStateInjectable),
      state: di.inject(extensionsInstallingInjectable),
      logger,
    });

    channel = registerEventSink(clearInstallingChannel, clearInstalling, logger);
  },
  instantiate: () => channel,
  injectionToken: clearInstallingChannelInjectionToken,
  lifecycle: lifecycleEnum.singleton,
});

export default clearInstallingChannelInjectable;
