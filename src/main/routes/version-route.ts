/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LensApiRequest } from "../router/router";
import { respondJson } from "../utils/http-responses";
import { getAppVersion } from "../../common/utils";

export class VersionRoute {
  static getVersion(request: LensApiRequest) {
    const { response } = request;

    respondJson(response, { version: getAppVersion() }, 200);
  }
}
