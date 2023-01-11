/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export default {
  require: jest.fn(),
  match: jest.fn(),
  app: {
    getVersion: jest.fn().mockReturnValue("3.0.0"),
    getLocale: jest.fn().mockRejectedValue("en"),
    getPath: jest.fn(() => "tmp"),
  },
  dialog: jest.fn(),
  ipcRenderer: {
    on: jest.fn(),
  },
};
