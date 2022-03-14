/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import * as selfsigned from "selfsigned";
import { createKubeAuthProxyCertFiles } from "./create-kube-auth-proxy-cert-files";
import getKubeAuthProxyCertDirInjectable from "./kube-auth-proxy-cert.injectable";
import writeFileInjectable from "../../common/fs/write-file.injectable";

const createKubeAuthProxyCertFilesInjectable = getInjectable({
  id: "create-kube-auth-proxy-cert-files",

  instantiate: async (di) => {
    const certPath = di.inject(getKubeAuthProxyCertDirInjectable);
    
    return createKubeAuthProxyCertFiles(certPath, {
      generate: selfsigned.generate, 
      writeFile: di.inject(writeFileInjectable),
    });
  },
});

export default createKubeAuthProxyCertFilesInjectable;
