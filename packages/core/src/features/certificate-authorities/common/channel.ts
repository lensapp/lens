/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getRequestChannel } from "../../../common/utils/channel/get-request-channel";

export const casChannel = getRequestChannel<void, string[]>("certificate-authorities");
