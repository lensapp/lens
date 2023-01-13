/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ServerResponse } from "http";
import { object } from "../../common/utils";

export interface LensServerResponse {
  statusCode: number;
  content: unknown;
  headers: Partial<Record<string, string | string[]>>;
}

export const writeServerResponseFor = (serverResponse: ServerResponse) => ({
  statusCode,
  content,
  headers,
}: LensServerResponse) => {
  serverResponse.statusCode = statusCode;

  for (const [name, value] of object.entries(headers)) {
    serverResponse.setHeader(name, value);
  }

  if (content instanceof Buffer) {
    serverResponse.write(content);
    serverResponse.end();
  } else if (content) {
    serverResponse.end(content);
  } else {
    serverResponse.end();
  }
};
