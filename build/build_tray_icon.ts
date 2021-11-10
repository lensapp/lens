/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import path from "path";
import sharp from "sharp";
import jsdom from "jsdom";
import fs from "fs-extra";
import logger from "../src/common/logger";

export async function generateTrayIcon(
  {
    outputFilename = "trayIcon",
    svgIconPath = path.resolve(__dirname, "../src/renderer/components/icon/logo-lens.svg"),
    outputFolder = path.resolve(__dirname, "./tray"),
    dpiSuffix = "2x",
    pixelSize = 32,
    shouldUseDarkColors = false, // managed by electron.nativeTheme.shouldUseDarkColors
  } = {}) {
  outputFilename += `${shouldUseDarkColors ? "Dark" : ""}Template`; // e.g. output trayIconDarkTemplate@2x.png
  dpiSuffix = dpiSuffix !== "1x" ? `@${dpiSuffix}` : "";
  const pngIconDestPath = path.resolve(outputFolder, `${outputFilename}${dpiSuffix}.png`);

  try {
    // Modify .SVG colors
    const trayIconColor = shouldUseDarkColors ? "black" : "white";
    const svgDom = await jsdom.JSDOM.fromFile(svgIconPath);
    const svgRoot = svgDom.window.document.body.getElementsByTagName("svg")[0];

    svgRoot.innerHTML += `<style>* {fill: ${trayIconColor} !important;}</style>`;
    const svgIconBuffer = Buffer.from(svgRoot.outerHTML);
    // Resize and convert to .PNG
    const pngIconBuffer: Buffer = await sharp(svgIconBuffer)
      .resize({ width: pixelSize, height: pixelSize })
      .png()
      .toBuffer();

    // Save icon
    await fs.writeFile(pngIconDestPath, pngIconBuffer);
    logger.info(`[DONE]: Tray icon saved at "${pngIconDestPath}"`);
  } catch (err) {
    logger.error(`[ERROR]: ${err}`);
  }
}

// Run
const iconSizes: Record<string, number> = {
  "1x": 16,
  "2x": 32,
  "3x": 48,
};

Object.entries(iconSizes).forEach(([dpiSuffix, pixelSize]) => {
  generateTrayIcon({ dpiSuffix, pixelSize, shouldUseDarkColors: false });
  generateTrayIcon({ dpiSuffix, pixelSize, shouldUseDarkColors: true });
});
