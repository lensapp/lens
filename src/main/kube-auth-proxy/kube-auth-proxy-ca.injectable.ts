/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getKubeAuthProxyCertDirInjectable from "../kube-auth-proxy/kube-auth-proxy-cert.injectable";
import path from "path";
import readFileInjectable from "../../common/fs/read-file.injectable";

const kubeAuthProxyCaInjectable = getInjectable({
  id: "kube-auth-proxy-ca",

  instantiate: (di) => {
    const certPath = di.inject(getKubeAuthProxyCertDirInjectable);
    const readFile = di.inject(readFileInjectable);

    return readFile(path.join(certPath, "proxy.crt"));
  },
});

export default kubeAuthProxyCaInjectable;
