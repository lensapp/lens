/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import installationStateLoggerInjectable from "../../../extensions/installation-state/logger.injectable";
import { SetInstalling, setInstallingChannel, setInstallingChannelInjectionToken } from "../../../extensions/installation-state/state-channels";
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

const nonInjectedSetInstalling = ({ logger, getInstallationState, state }: Dependencies)=> (
  (extId: string): void =>  {
    logger.debug(`trying to set ${extId} as installing`);

    const curState = getInstallationState(extId);

    if (curState !== InstallationState.IDLE) {
      throw new Error(`cannot set ${extId} as installing. Is currently ${curState}.`);
    }

    state.add(extId);
  }
);

let channel: SetInstalling;

/**
 * Strictly sets the INSTALLING state of an extension
 * @param extId The ID of the extension
 * @throws if state is not IDLE
 */
const setInstallingChannelInjectable = getInjectable({
  setup: (di) => {
    const registerEventSink = di.inject(registerEventSinkInjectable);
    const logger = di.inject(installationStateLoggerInjectable);
    const setInstalling = nonInjectedSetInstalling({
      getInstallationState: di.inject(getInstallationStateInjectable),
      state: di.inject(extensionsInstallingInjectable),
      logger,
    });

    channel = registerEventSink(setInstallingChannel, setInstalling, logger);
  },
  instantiate: () => channel,
  injectionToken: setInstallingChannelInjectionToken,
  lifecycle: lifecycleEnum.singleton,
});

export default setInstallingChannelInjectable;
