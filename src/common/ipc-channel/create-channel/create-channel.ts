/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Channel } from "../channel";

export const createChannel = <TInstance>(name: string): Channel<TInstance> => ({
  name,
  _template: null,
});
