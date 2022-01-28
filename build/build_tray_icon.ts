/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import path from "path";
import sharp from "sharp";
import jsdom from "jsdom";
import fs from "fs-extra";

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
    console.info(`[DONE]: Tray icon saved at "${pngIconDestPath}"`);
  } catch (err) {
    console.error(`[ERROR]: ${String(err)}`);
  }
}

// Run
const iconSizes: Record<string, number> = {
  "1x": 16,
  "2x": 32,
  "3x": 48,
};

for (const dpiSuffix in iconSizes) {
  const pixelSize = iconSizes[dpiSuffix];

  generateTrayIcon({ dpiSuffix, pixelSize, shouldUseDarkColors: false });
  generateTrayIcon({ dpiSuffix, pixelSize, shouldUseDarkColors: true });
}
