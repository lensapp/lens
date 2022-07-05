/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { ensureDir, readFile } from "fs-extra";
import { JSDOM } from "jsdom";
import path from "path";
import sharp from "sharp";

const size = Number(process.env.OUTPUT_SIZE || "16");
const outputFolder = process.env.OUTPUT_DIR || "./build/tray";
const inputFile = process.env.INPUT_SVG_PATH || "./src/renderer/components/icon/logo-lens.svg";
const noticeFile = process.env.NOTICE_SVG_PATH || "./src/renderer/components/icon/notice.svg";
const spinnerFile = process.env.SPINNER_SVG_PATH || "./src/renderer/components/icon/arrow-spinner.svg";

async function ensureOutputFoler() {
  await ensureDir(outputFolder);
}

function getSvgStyling(colouring: "dark" | "light"): string {
  return `
    <style>
      ellipse {
        stroke: ${colouring === "dark" ? "white" : "black"} !important;
      }
      path, rect {
        fill: ${colouring === "dark" ? "white" : "black"} !important;
      }
    </style>
  `;
}

type TargetSystems = "macos" | "windows-or-linux";

async function getBaseIconImage(system: TargetSystems) {
  const svgData = await readFile(inputFile, { encoding: "utf-8" });
  const dom = new JSDOM(`<body>${svgData}</body>`);
  const root = dom.window.document.body.getElementsByTagName("svg")[0];

  root.innerHTML += getSvgStyling(system === "macos" ? "light" : "dark");

  return Buffer.from(root.outerHTML);
}

async function generateImage(image: Buffer, size: number, namePrefix: string) {
  sharp(image)
    .resize({ width: size, height: size })
    .png()
    .toFile(path.join(outputFolder, `${namePrefix}.png`));
}

async function generateImages(image: Buffer, size: number, name: string) {
  await Promise.all([
    generateImage(image, size, name),
    generateImage(image, size*2, `${name}@2x`),
    generateImage(image, size*3, `${name}@3x`),
    generateImage(image, size*4, `${name}@4x`),
  ]);
}

async function generateImageWithSvg(baseImage: Buffer, system: TargetSystems, filePath: string) {
  const svgFile = await getIconImage(system, filePath);

  const circleBuffer = await sharp(Buffer.from(`
    <svg viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="32" fill="black" />
    </svg>
  `))
    .toBuffer();

  return sharp(baseImage)
    .resize({ width: 128, height: 128 })
    .composite([
      {
        input: circleBuffer,
        top: 64,
        left: 64,
        blend: "dest-out",
      },
      {
        input: (
          await sharp(svgFile)
            .resize({
              width: 60,
              height: 60,
            })
            .toBuffer()
        ),
        top: 66,
        left: 66,
      },
    ])
    .toBuffer();
}

async function getIconImage(system: TargetSystems, filePath: string) {
  const svgData = await readFile(filePath, { encoding: "utf-8" });
  const root = new JSDOM(svgData).window.document.getElementsByTagName("svg")[0];

  root.innerHTML += getSvgStyling(system === "macos" ? "light" : "dark");

  return Buffer.from(root.outerHTML);
}

async function generateTrayIcons() {
  try {
    console.log("Generating tray icon pngs");
    await ensureOutputFoler();

    const baseIconTemplateImage = await getBaseIconImage("macos");
    const baseIconImage = await getBaseIconImage("windows-or-linux");

    const updateAvailableTemplateImage = await generateImageWithSvg(baseIconTemplateImage, "macos", noticeFile);
    const updateAvailableImage = await generateImageWithSvg(baseIconImage, "windows-or-linux", noticeFile);

    const checkingForUpdatesTemplateImage = await generateImageWithSvg(baseIconTemplateImage, "macos", spinnerFile);
    const checkingForUpdatesImage = await generateImageWithSvg(baseIconImage, "windows-or-linux", spinnerFile);

    await Promise.all([
      // Templates are for macOS only
      generateImages(baseIconTemplateImage, size, "trayIconTemplate"),
      generateImages(updateAvailableTemplateImage, size, "trayIconUpdateAvailableTemplate"),
      generateImages(updateAvailableTemplateImage, size, "trayIconUpdateAvailableTemplate"),
      generateImages(checkingForUpdatesTemplateImage, size, "trayIconCheckingForUpdatesTemplate"),

      // Non-templates are for windows and linux
      generateImages(baseIconImage, size, "trayIcon"),
      generateImages(updateAvailableImage, size, "trayIconUpdateAvailable"),
      generateImages(checkingForUpdatesImage, size, "trayIconCheckingForUpdates"),
    ]);

    console.log("Generated all images");
  } catch (error) {
    console.error(error);
  }
}

generateTrayIcons();
