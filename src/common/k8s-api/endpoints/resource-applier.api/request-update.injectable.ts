/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { apiBaseInjectionToken } from "../../api-base";
import type { KubeJsonApiData } from "../../kube-json-api";

export type RequestKubeObjectCreation = (resourceDescriptor: string) => Promise<KubeJsonApiData>;

const requestKubeObjectCreationInjectable = getInjectable({
  id: "request-kube-object-creation",
  instantiate: (di): RequestKubeObjectCreation => {
    const apiBase = di.inject(apiBaseInjectionToken);

    return (data) => apiBase.post("/stack", { data });
  },
});

export default requestKubeObjectCreationInjectable;
