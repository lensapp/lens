/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import observableHistoryInjectable from "./observable-history.injectable";
import type { PageParamDependencies, PageParamInit } from "./page-param";
import { PageParam } from "./page-param";

export type CreatePageParam = <Value = string>(init: PageParamInit<Value>) => PageParam<Value>;

const createPageParamInjectable = getInjectable({
  id: "create-page-param",
  instantiate: (di): CreatePageParam => {
    const deps: PageParamDependencies = {
      history: di.inject(observableHistoryInjectable),
    };

    return (init) => new PageParam(deps, init);
  },
});

export default createPageParamInjectable;
