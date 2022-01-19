/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * Mock the global window variable
 */
export function mockWindow() {
  Object.defineProperty(window, "requestIdleCallback", {
    writable: true,
    value: jest.fn().mockImplementation(callback => callback()),
  });

  Object.defineProperty(window, "cancelIdleCallback", {
    writable: true,
    value: jest.fn(),
  });
}
