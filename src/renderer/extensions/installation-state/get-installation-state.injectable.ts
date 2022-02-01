/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { ObservableSet } from "mobx";
import { InstallationState } from "../../../extensions/installation-state/state";
import extensionsInstallingInjectable from "./installing.injectable";
import extensionsUninstallingInjectable from "./uninstalling.injectable";

interface Dependencies {
  installingState: ObservableSet<string>;
  uninstallingState: ObservableSet<string>;
}

const getInstallationState = ({ installingState, uninstallingState }: Dependencies) => (
  (extId: string): InstallationState => {
    if (installingState.has(extId)) {
      return InstallationState.INSTALLING;
    }

    if (uninstallingState.has(extId)) {
      return InstallationState.UNINSTALLING;
    }

    return InstallationState.IDLE;
  }
);

const getInstallationStateInjectable = getInjectable({
  instantiate: (di) => getInstallationState({
    installingState: di.inject(extensionsInstallingInjectable),
    uninstallingState: di.inject(extensionsUninstallingInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default getInstallationStateInjectable;
