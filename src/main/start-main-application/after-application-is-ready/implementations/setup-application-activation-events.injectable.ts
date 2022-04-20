/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { runManyFor } from "../../run-many-for";
import onApplicationActivateInjectable from "../../../electron-app/on-application-activate.injectable";
import type { ActivationArgs } from "../../after-application-activation/after-application-activation-injection-token";
import { afterApplicationActivationInjectionToken } from "../../after-application-activation/after-application-activation-injection-token";
import { afterApplicationIsReadyInjectionToken } from "../after-application-is-ready-injection-token";

const setupApplicationActivationEventsInjectable = getInjectable({
  id: "setup-application-activation-events",

  instantiate: (di) => {
    const onApplicationActivate = di.inject(onApplicationActivateInjectable);
    const runRunnablesAfterApplicationActivation = runManyFor(di)(afterApplicationActivationInjectionToken);

    return {
      run: () => {
        onApplicationActivate(async (activationArgs: ActivationArgs) => {
          await runRunnablesAfterApplicationActivation(activationArgs);
        });
      },
    };
  },

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default setupApplicationActivationEventsInjectable;
