/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Pod } from "../../../common/k8s-api/endpoints";
import podStoreInjectable from "./store.injectable";

export type GetPodById = (id: string) => Pod | undefined;

const getPodByIdInjectable = getInjectable({
  id: "get-pod-by-id",
  instantiate: (di): GetPodById => {
    const store = di.inject(podStoreInjectable);

    return id => store.getById(id);
  },
});

export default getPodByIdInjectable;
