/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

module.exports = {
  "overrides": [
    {
      files: [
        "**/*.ts",
        "**/*.tsx",
      ],
      rules: {
        "import/no-unresolved": ["error", {
          ignore: ["@k8slens/extensions"],
        }],
      },
    },
  ],
};
