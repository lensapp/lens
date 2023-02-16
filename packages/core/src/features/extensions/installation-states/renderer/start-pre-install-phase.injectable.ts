/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import type { Disposer } from "../../../../common/utils";
import preinstallingPhasesInjectable from "./preinstalling.injectable";
import * as uuid from "uuid";

export type StartPreInstallPhase = () => Disposer;

const startPreInstallPhaseInjectable = getInjectable({
  id: "start-pre-install-phase",
  instantiate: (di): StartPreInstallPhase => {
    const preinstalling = di.inject(preinstallingPhasesInjectable);

    return action(() => {
      const preInstallStepId = uuid.v4();

      preinstalling.add(preInstallStepId);

      return () => preinstalling.delete(preInstallStepId);
    });
  },
});

export default startPreInstallPhaseInjectable;
