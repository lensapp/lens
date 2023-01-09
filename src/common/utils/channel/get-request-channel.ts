/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RequestChannel } from "./request-channel";

export const getRequestChannel = <Request, Response>(id: string): RequestChannel<Request, Response> => ({
  id,
});
