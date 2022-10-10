/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { RequestInit } from "node-fetch";
import fetchInjectable from "../fetch/fetch.injectable";
import loggerInjectable from "../logger.injectable";
import type { JsonApiConfig, JsonApiData, JsonApiDependencies, JsonApiParams } from "./json-api";
import { JsonApi } from "./json-api";

export type CreateJsonApi = <Data = JsonApiData, Params extends JsonApiParams<Data> = JsonApiParams<Data>>(config: JsonApiConfig, reqInit?: RequestInit) => JsonApi<Data, Params>;

const createJsonApiInjectable = getInjectable({
  id: "create-json-api",
  instantiate: (di): CreateJsonApi => {
    const deps: JsonApiDependencies = {
      fetch: di.inject(fetchInjectable),
      logger: di.inject(loggerInjectable),
    };

    return (config, reqInit) => new JsonApi(deps, config, reqInit);
  },
});

export default createJsonApiInjectable;
