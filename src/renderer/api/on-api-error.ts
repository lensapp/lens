/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Response } from "node-fetch";
import type { JsonApiErrorParsed } from "../../common/k8s-api/json-api";
import { Notifications } from "../components/notifications";

export function onApiError(error: JsonApiErrorParsed, res: Response) {
  switch (res.status) {
    case 403:
      error.isUsedForNotification = true;
      Notifications.error(error);
      break;
  }
}
