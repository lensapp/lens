/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { setupIpcMainHandlers } from "./setup-ipc-main-handlers";
import clusterStoreInjectable from "../../../../common/cluster-store/cluster-store.injectable";
import { onLoadOfApplicationInjectionToken } from "../../../start-main-application/runnable-tokens/on-load-of-application-injection-token";
import applicationMenuItemCompositeInjectable from "../../../../features/application-menu/main/application-menu-item-composite.injectable";
import emitAppEventInjectable from "../../../../common/app-event-bus/emit-event.injectable";
import getClusterByIdInjectable from "../../../../common/cluster-store/get-by-id.injectable";
import clusterFramesInjectable from "../../../../common/cluster-frames.injectable";
import prefixedLoggerInjectable from "../../../../common/logger/prefixed-logger.injectable";

const setupIpcMainHandlersInjectable = getInjectable({
  id: "setup-ipc-main-handlers",

  instantiate: (di) => ({
    id: "setup-ipc-main-handlers",
    run: () => {
      const logger = di.inject(prefixedLoggerInjectable, "APP-MAIN");

      logger.debug("initializing ipc main handlers");

      setupIpcMainHandlers({
        applicationMenuItemComposite: di.inject(applicationMenuItemCompositeInjectable),
        clusterStore: di.inject(clusterStoreInjectable),
        emitAppEvent: di.inject(emitAppEventInjectable),
        getClusterById: di.inject(getClusterByIdInjectable),
        clusterFrameMap: di.inject(clusterFramesInjectable),
      });
    },
  }),

  injectionToken: onLoadOfApplicationInjectionToken,
  causesSideEffects: true,
});

export default setupIpcMainHandlersInjectable;
