/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import fs from "fs-extra";
import path from "path";
import defaultBaseLensTheme from "../src/renderer/themes/lens-dark";

const outputCssFile = path.resolve("src/renderer/themes/theme-vars.css");

const content = [
  "/**",
  " * Generated Lens theme CSS-variables, don't edit manually.",
  " */",
  "",
  ":root {",
  ...Object.entries(defaultBaseLensTheme.colors)
    .map(([varName, value]) => `  --${varName}: ${value};`),
  "}",
  "",
].join("\n");

// Run
console.log("Writing out new generated src/renderer/themes/theme-vars.css file");
fs.ensureFileSync(outputCssFile);
fs.writeFile(outputCssFile, content);
