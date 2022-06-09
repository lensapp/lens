/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { observable } from "mobx";

const customHelmRepoInjectable = getInjectable({
  id: "custom-helm-repo",

  instantiate: () => observable({
    name: "",
    url: "",
    username: "",
    password: "",
    insecureSkipTlsVerify: false,
    caFile: "",
    keyFile: "",
    certFile: "",
  }),

  lifecycle: lifecycleEnum.transient,
});

export default customHelmRepoInjectable;
