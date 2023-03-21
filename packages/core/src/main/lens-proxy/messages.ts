/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import http from "http";

export class ProxyIncomingMessage extends http.IncomingMessage {
  declare url: string;
  declare method: string;
}
