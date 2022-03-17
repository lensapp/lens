/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { isClusterPageContext } from "../utils";
import { KubeJsonApi } from "./kube-json-api";
import { apiKubePrefix, isDevelopment } from "../vars";

export const apiKube = isClusterPageContext()
  ? new KubeJsonApi({
    serverAddress: `http://127.0.0.1:${window.location.port}`,
    apiBase: apiKubePrefix,
    debug: isDevelopment,
  }, {
    headers: {
      "Host": window.location.host,
    },
  })
  : undefined as never;
