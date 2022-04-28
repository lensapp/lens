/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export interface Logger {
  info: (message: string, ...args: any) => void;
  error: (message: string, ...args: any) => void;
  debug: (message: string, ...args: any) => void;
  warn: (message: string, ...args: any) => void;
}
