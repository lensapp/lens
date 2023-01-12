/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Authentication, Interceptor, KubeConfig } from "@kubernetes/client-node";
import { getInjectable } from "@ogre-tools/injectable";
import authHeaderValueInjectable from "../../features/auth-header/common/header-value.injectable";
import { lensAuthHeaderName } from "../../features/auth-header/common/vars";

export interface ApiType {
  defaultHeaders: any;
  setDefaultAuthentication(config: Authentication): void;
  addInterceptor(interceptor: Interceptor): void;
}

export type MakeApiClient = <T extends ApiType>(config: KubeConfig, apiClientType: new (server: string) => T) => T;

const makeApiClientInjectable = getInjectable({
  id: "make-api-client",
  instantiate: (di): MakeApiClient => {
    const authHeaderValue = di.inject(authHeaderValueInjectable);

    return (config, apiClientType) => {
      const api = config.makeApiClient(apiClientType);

      api.addInterceptor((opts) => {
        opts.headers ??= {};
        opts.headers[lensAuthHeaderName] = authHeaderValue;
      });

      return api;
    };
  },
});

export default makeApiClientInjectable;
