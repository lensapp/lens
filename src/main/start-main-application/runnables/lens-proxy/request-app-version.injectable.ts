/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import lensFetchInjectable from "../../../../common/fetch/lens-fetch.injectable";

const requestAppVersionViaProxyInjectable = getInjectable({
  id: "request-app-version-via-proxy",
  instantiate: (di) => {
    const lensFetch = di.inject(lensFetchInjectable);

    return async () => {
      const response = await lensFetch("/version");

      return (await response.json() as { version: string }).version;
    };
  },
});

export default requestAppVersionViaProxyInjectable;
