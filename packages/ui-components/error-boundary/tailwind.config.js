/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

const path = require('path');

module.exports = {
  content: [
    path.join(__dirname, "src/**/*.tsx")
  ],
  darkMode: "class",
  theme: {
    fontFamily: {
      sans: ["Roboto", "Helvetica", "Arial", "sans-serif"],
    },
    extend: {
      colors: {
        textAccent: "var(--textColorAccent)",
        textPrimary: "var(--textColorPrimary)",
        textTertiary: "var(--textColorTertiary)",
        textDimmed: "var(--textColorDimmed)",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
