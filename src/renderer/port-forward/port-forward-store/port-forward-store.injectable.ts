/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { PortForwardStore } from "./port-forward-store";
import type { ForwardedPort } from "../port-forward-item";
import createStorageInjectable from "../../utils/create-storage/create-storage.injectable";
import notifyErrorPortForwardingInjectable from "../notify-error-port-forwarding.injectable";
import { apiBaseInjectionToken } from "../../../common/k8s-api/api-base";
import requestActivePortForwardInjectable from "./request-active-port-forward.injectable";

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
      apiBase: di.inject(apiBaseInjectionToken),
      requestActivePortForward: di.inject(requestActivePortForwardInjectable),
    });
  },
});

export default portForwardStoreInjectable;
