/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import { getKubeAuthProxyCertificatePath } from "./kube-auth-proxy-cert";
import createKubeAuthProxyCertFilesInjectable from "./create-kube-auth-proxy-cert-files.injectable";

const getKubeAuthProxyCertDirInjectable = getInjectable({
  id: "get-kube-auth-proxy-cert-dir",

  setup: async (di) => {
    await di.inject(createKubeAuthProxyCertFilesInjectable);
  },

  instantiate: (di) => getKubeAuthProxyCertificatePath(di.inject(directoryForUserDataInjectable)),
});

export default getKubeAuthProxyCertDirInjectable;
