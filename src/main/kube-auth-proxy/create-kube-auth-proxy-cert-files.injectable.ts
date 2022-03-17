/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import * as selfsigned from "selfsigned";
import { createKubeAuthProxyCertFiles } from "./create-kube-auth-proxy-cert-files";
import writeFileInjectable from "../../common/fs/write-file.injectable";
import directoryForUserDataInjectable from "../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import path from "path";

const createKubeAuthProxyCertFilesInjectable = getInjectable({
  id: "create-kube-auth-proxy-cert-files",

  instantiate: async (di) => {
    const userData = di.inject(directoryForUserDataInjectable);
    const certPath = path.join(userData, "kube-auth-proxy");
    
    return createKubeAuthProxyCertFiles(certPath, {
      generate: selfsigned.generate, 
      writeFile: di.inject(writeFileInjectable),
    });
  },
});

export default createKubeAuthProxyCertFilesInjectable;
