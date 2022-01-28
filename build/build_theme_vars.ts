/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import fs from "fs-extra";
import path from "path";
import defaultBaseLensTheme from "../src/renderer/internal-themes/lens-dark.json";

const outputCssFile = path.resolve("src/renderer/internal-themes/theme-vars.css");

const banner = `/*
    Generated Lens theme CSS-variables, don't edit manually.
    To refresh file run $: yarn run ts-node build/${path.basename(__filename)}
*/`;

const themeCssVars = Object.entries(defaultBaseLensTheme.colors)
  .map(([varName, value]) => `--${varName}: ${value};`);

const content = `
${banner}

:root {
${themeCssVars.join("\n")}
}
`;

// Run
console.info(`"Saving default Lens theme css-variables to "${outputCssFile}""`);
fs.ensureFileSync(outputCssFile);
fs.writeFileSync(outputCssFile, content);
