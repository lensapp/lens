/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import path from "path";
import readFileInjectable from "../../common/fs/read-file.injectable";
import createKubeAuthProxyCertFilesInjectable from "./create-kube-auth-proxy-cert-files.injectable";

const kubeAuthProxyCaInjectable = getInjectable({
  id: "kube-auth-proxy-ca",

  instantiate: async (di) => {
    const certPath = await di.inject(createKubeAuthProxyCertFilesInjectable);
    
    const readFile = di.inject(readFileInjectable);

    return readFile(path.join(certPath, "proxy.crt"));
  },
});

export default kubeAuthProxyCaInjectable;
