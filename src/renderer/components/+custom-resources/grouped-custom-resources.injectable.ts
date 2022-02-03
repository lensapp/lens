/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed, IComputedValue } from "mobx";
import type { CustomResourceDefinition } from "../../../common/k8s-api/endpoints";
import { getOrInsert } from "../../utils";
import customResourceDefinitionsInjectable from "./custom-resources.injectable";

interface Dependencies {
  definitions: IComputedValue<CustomResourceDefinition[]>;
}

function getGroupedCustomResourceDefinitions({ definitions }: Dependencies) {
  return computed(() => {
    const groups = new Map<string, CustomResourceDefinition[]>();

    for (const crd of definitions.get()) {
      getOrInsert(groups, crd.getGroup(), []).push(crd);
    }

    return groups;
  });
}

const groupedCustomResourceDefinitionsInjectable = getInjectable({
  instantiate: (di) => getGroupedCustomResourceDefinitions({
    definitions: di.inject(customResourceDefinitionsInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default groupedCustomResourceDefinitionsInjectable;
