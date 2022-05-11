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

svgRoot.innerHTML += `<style>* {fill: white !important;}</style>`;
const lightTemplate = svgRoot.outerHTML;

svgRoot.innerHTML += `<style>* {fill: black !important;}</style>`;

const darkTemplate = svgRoot.outerHTML;

console.log("Generating tray icon pngs");

ensureDirSync(outputFolder);

Promise.all([
  sharp(Buffer.from(lightTemplate))
    .resize({ width: size, height: size })
    .png()
    .toFile(path.join(outputFolder, "trayIconDarkTemplate.png")),
  sharp(Buffer.from(lightTemplate))
    .resize({ width: size*2, height: size*2 })
    .png()
    .toFile(path.join(outputFolder, "trayIconDarkTemplate@2x.png")),
  sharp(Buffer.from(darkTemplate))
    .resize({ width: size, height: size })
    .png()
    .toFile(path.join(outputFolder, "trayIconTemplate.png")),
  sharp(Buffer.from(darkTemplate))
    .resize({ width: size*2, height: size*2 })
    .png()
    .toFile(path.join(outputFolder, "trayIconTemplate@2x.png")),
])
  .then((resolutions) => console.log(`Generated ${resolutions.length} images`))
  .catch(console.error);
