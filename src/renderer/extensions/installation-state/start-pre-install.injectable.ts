/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { ObservableSet } from "mobx";
import type { LensLogger } from "../../../common/logger";
import type { Disposer } from "../../utils";
import uniqueIdInjectable from "../../../common/utils/unique-id.injectable";
import installationStateLoggerInjectable from "../../../extensions/installation-state/logger.injectable";
import extensionsPreinstallingInjectable from "./pre-installing.injectable";

interface Dependencies {
  getUniqueId: () => string;
  state: ObservableSet<string>;
  logger: LensLogger;
}

const startPreInstall = ({ getUniqueId, state, logger }: Dependencies) => (
  (): Disposer => {
    const preInstallStepId = getUniqueId();

    logger.debug(`starting a new preinstall phase: ${preInstallStepId}`);
    state.add(preInstallStepId);

    return () => {
      logger.debug(`ending a preinstall phase: ${preInstallStepId}`);
      state.delete(preInstallStepId);
    };
  }
);

/**
 * Marks the start of a pre-install phase of an extension installation. The
 * part of the installation before the tarball has been unpacked and the ID
 * determined.
 * @returns a disposer which should be called to mark the end of the install phase
 */
const startPreInstallInjectable = getInjectable({
  instantiate: (di) => startPreInstall({
    getUniqueId: di.inject(uniqueIdInjectable),
    logger: di.inject(installationStateLoggerInjectable),
    state: di.inject(extensionsPreinstallingInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default startPreInstallInjectable;
