/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Patch } from "rfc6902";
import apiBaseInjectable from "../../api-base.injectable";
import type { KubeJsonApiData } from "../../kube-json-api";

export type RequestKubeObjectPatch = (name: string, kind: string, ns: string | undefined, patch: Patch) => Promise<KubeJsonApiData>;

const requestKubeObjectPatchInjectable = getInjectable({
  id: "request-kube-object-patch",
  instantiate: (di): RequestKubeObjectPatch => {
    const apiBase = di.inject(apiBaseInjectable);

    return (name, kind, ns, patch) => (
      apiBase.patch("/stack", {
        data: {
          name,
          kind,
          ns,
          patch,
        },
      })
    );
  },
});

export default requestKubeObjectPatchInjectable;
