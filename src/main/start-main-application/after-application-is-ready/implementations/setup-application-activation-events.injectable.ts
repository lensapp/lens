/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { runManyFor } from "../../run-many-for";
import afterApplicationActivationInjectable from "../../../electron-app/after-application-activation.injectable";
import { afterApplicationActivationInjectionToken } from "../../after-application-activation/after-application-activation-injection-token";
import { afterApplicationIsReadyInjectionToken } from "../after-application-is-ready-injection-token";

const setupApplicationActivationEventsInjectable = getInjectable({
  id: "setup-application-activation-events",

  instantiate: (di) => {
    const afterApplicationActivation = di.inject(afterApplicationActivationInjectable);
    const runRunnables = runManyFor(di)(afterApplicationActivationInjectionToken);

    return {
      run: () => {
        afterApplicationActivation(runRunnables);
      },
    };
  },

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default setupApplicationActivationEventsInjectable;
