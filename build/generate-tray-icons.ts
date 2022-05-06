/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { readFileSync } from "fs";
import { ensureDirSync } from "fs-extra";
import { JSDOM } from "jsdom";
import path from "path";
import sharp from "sharp";

const size = Number(process.env.OUTPUT_SIZE || "16");
const outputFolder = process.env.OUTPUT_DIR || "./build/tray";
const inputFile = process.env.INPUT_SVG_PATH || "./src/renderer/components/icon/logo-lens.svg";

const svgData = readFileSync(inputFile, { encoding: "utf-8" });
const svgDom = new JSDOM(`<body>${svgData}</body>`);
const svgRoot = svgDom.window.document.body.getElementsByTagName("svg")[0];

svgRoot.innerHTML += `<style>* {fill: black !important;}</style>`;

console.log("Generating tray icon pngs");

ensureDirSync(outputFolder);

Promise.allSettled([
  sharp(Buffer.from(svgRoot.outerHTML))
    .resize({ width: size, height: size })
    .png()
    .toFile(path.join(outputFolder, "trayIconTemplate.png")),
  sharp(Buffer.from(svgRoot.outerHTML))
    .resize({ width: size*2, height: size*2 })
    .png()
    .toFile(path.join(outputFolder, "trayIconTemplate@2x.png")),
])
  .then(console.log)
  .catch(console.error);
