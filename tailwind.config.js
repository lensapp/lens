/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

module.exports = {
  content: ["src/**/*.tsx"],
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
