/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observableHistoryInjectionToken } from "@k8slens/routing";
import type { PageParamDeclaration, PageParamDependencies, PageParamInit, WithName } from "./page-param";
import { PageParam } from "./page-param";

export type CreatePageParam = <Value = string>(init: PageParamInit<Value>) => PageParam<Value>;

const createPageParamInjectable = getInjectable({
  id: "create-page-param",
  instantiate: (di): CreatePageParam => {
    const deps: PageParamDependencies = {
      history: di.inject(observableHistoryInjectionToken),
    };

    return <Value>(init: PageParamInit<Value>) => (
      new PageParam<Value>(deps, init as unknown as (PageParamDeclaration<Value> & WithName))
    );
  },
});

export default createPageParamInjectable;
