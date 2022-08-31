/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import emitEventInjectable from "../../../common/app-event-bus/emit-event.injectable";

const emitTelemetryInjectable = getInjectable({
  id: "emit-telemetry",

  instantiate: (di) => {
    const emitEvent = di.inject(emitEventInjectable);

    return ({ action, args }: { action: string; args: any[] }) => {
      emitEvent({
        destination: "auto-capture",
        action: "telemetry-from-business-action",
        name: action,
        params: { args },
      });
    };
  },

  decorable: false,
});

export default emitTelemetryInjectable;
