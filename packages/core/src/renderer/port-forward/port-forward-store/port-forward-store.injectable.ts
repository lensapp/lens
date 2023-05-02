/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { PortForwardStore } from "./port-forward-store";
import type { ForwardedPort } from "../port-forward-item";
import createStorageInjectable from "../../utils/create-storage/create-storage.injectable";
import notifyErrorPortForwardingInjectable from "../notify-error-port-forwarding.injectable";
import requestActivePortForwardInjectable from "./request-active-port-forward.injectable";
import apiBaseInjectable from "../../../common/k8s-api/api-base.injectable";
import { loggerInjectionToken } from "@k8slens/logger";

const portForwardStoreInjectable = getInjectable({
  id: "port-forward-store",

  instantiate: (di) => {
    const createStorage = di.inject(createStorageInjectable);

    return new PortForwardStore({
      storage: createStorage<ForwardedPort[] | undefined>(
        "port_forwards",
        undefined,
      ),
      notifyErrorPortForwarding: di.inject(notifyErrorPortForwardingInjectable),
      apiBase: di.inject(apiBaseInjectable),
      requestActivePortForward: di.inject(requestActivePortForwardInjectable),
      logger: di.inject(loggerInjectionToken),
    });
  },
});

export default portForwardStoreInjectable;
