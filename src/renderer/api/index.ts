/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { JsonApiErrorParsed } from "../../common/k8s-api/json-api";
import type { Response } from "node-fetch";
import { Notifications } from "../components/notifications";
import { apiBase, apiKube } from "../../common/k8s-api";
export { apiBase, apiKube } from "../../common/k8s-api";


// Common handler for HTTP api errors
export function onApiError(error: JsonApiErrorParsed, res: Response) {
  switch (res.status) {
    case 403:
      error.isUsedForNotification = true;
      Notifications.error(error);
      break;
  }
}

if (apiBase) apiBase.onError.addListener(onApiError);
if (apiKube) apiKube.onError.addListener(onApiError);
