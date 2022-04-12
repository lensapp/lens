/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { ApiManager } from "./api-manager";

/**
 * @deprecated use `di.inject(apiManagerInjectable)` instead
 */
export const apiManager = new ApiManager();
