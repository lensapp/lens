/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Channel } from "../channel";

/**
 * @deprecated Switch to using newer version of Channel abstraction
 */
export const createChannel = <Message>(name: string): Channel<Message> => ({
  name,
  _template: null as never,
});
