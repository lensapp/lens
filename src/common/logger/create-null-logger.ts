/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { LensLogger } from "../logger";

export interface MockLensLogger extends LensLogger {
  debug: jest.Mock<any, any>;
  warn: jest.Mock<any, any>;
  silly: jest.Mock<any, any>;
  info: jest.Mock<any, any>;
  error: jest.Mock<any, any>;
}

export function createMockLogger(): MockLensLogger {
  return {
    debug: jest.fn(),
    warn: jest.fn(),
    silly: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  };
}
