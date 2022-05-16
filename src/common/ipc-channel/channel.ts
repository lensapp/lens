/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * @deprecated Switch to using newer version of Channel abstraction
 */
export interface Channel<TInstance> {
  name: string;
  _template: TInstance;
}
