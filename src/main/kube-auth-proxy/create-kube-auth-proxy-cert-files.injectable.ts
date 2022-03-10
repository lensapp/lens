/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { access, mkdir, writeFile } from "fs/promises";
import directoryForUserDataInjectable from "../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import { getKubeAuthProxyCertificatePath } from "./kube-auth-proxy-cert";
import * as selfsigned from "selfsigned";
import { createKubeAuthProxyCertFiles } from "./create-kube-auth-proxy-cert-files";

const createKubeAuthProxyCertFilesInjectable = getInjectable({
  id: "create-kube-auth-proxy-cert-files",

  instantiate: async (di) => {
    const userData = di.inject(directoryForUserDataInjectable);
    const certPath = getKubeAuthProxyCertificatePath(userData);
    
    return createKubeAuthProxyCertFiles(certPath, {
      generate: selfsigned.generate,
      access, mkdir, writeFile,
    });
  },
});

export default createKubeAuthProxyCertFilesInjectable;
