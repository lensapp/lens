/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { HelmRepo } from "../../../../../../common/helm/helm-repo";

const customHelmRepoInjectable = getInjectable({
  id: "custom-helm-repo",

  instantiate: () => observable.object<HelmRepo>({
    name: "",
    url: "",
    username: "",
    password: "",
    insecureSkipTlsVerify: false,
    caFile: "",
    keyFile: "",
    certFile: "",
    cacheFilePath: "",
  }),

  lifecycle: lifecycleEnum.transient,
});

export default customHelmRepoInjectable;
