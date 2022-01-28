/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { Pod } from "../../../common/k8s-api/endpoints";
import { bind } from "../../utils";
import type { PodStore } from "./store";
import podStoreInjectable from "./store.injectable";

interface Dependencies {
  podStore: PodStore;
}

function getPodById({ podStore }: Dependencies, id: string): Pod | undefined {
  return podStore.getById(id);
}

const getPodByIdInjectable = getInjectable({
  instantiate: (di) => bind(getPodById, null, {
    podStore: di.inject(podStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default getPodByIdInjectable;

