/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import directoryForTempInjectable from "../../common/app-paths/directory-for-temp.injectable";
import { KubeconfigManager } from "./kubeconfig-manager";
import getProxyPortInjectable from "../lens-proxy/get-proxy-port.injectable";
import { bind } from "../../common/utils";

const createKubeconfigManagerInjectable = getInjectable({
  instantiate: (di) => bind(KubeconfigManager.create, null, {
    directoryForTemp: di.inject(directoryForTempInjectable),
    proxyPort: di.inject(getProxyPortInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default createKubeconfigManagerInjectable;
