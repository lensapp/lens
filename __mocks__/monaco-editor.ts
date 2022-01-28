/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

module.exports = {
  languages: {
    register: jest.fn(),
    setMonarchTokensProvider: jest.fn(),
    registerCompletionItemProvider: jest.fn(),
  },
  editor: {
    defineTheme: jest.fn(),
    getModel: jest.fn(),
    createModel: jest.fn(),
  },
  Uri: {
    file: jest.fn(),
  },
};
