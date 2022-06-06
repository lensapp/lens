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

async function ensureOutputFoler() {
  await ensureDir(outputFolder);
}

function getSvgStyling(colouring: "dark" | "light"): string {
  return `
    <style>
      ellipse {
        stroke: ${colouring === "dark" ? "white" : "black"} !important;
        fill: ${colouring === "dark" ? "black" : "white"} !important;
      }
      path, rect {
        fill: ${colouring === "dark" ? "white" : "black"} !important;
      }
    </style>
  `;
}

async function getBaseIconTemplates() {
  const svgData = await readFile(inputFile, { encoding: "utf-8" });

  const darkDom = new JSDOM(`<body>${svgData}</body>`);
  const darkRoot = darkDom.window.document.body.getElementsByTagName("svg")[0];

  darkRoot.innerHTML += getSvgStyling("dark");

  const lightDom = new JSDOM(`<body>${svgData}</body>`);
  const lightRoot = lightDom.window.document.body.getElementsByTagName("svg")[0];

  lightRoot.innerHTML += getSvgStyling("light");

  return {
    light: lightRoot.outerHTML,
    dark: darkRoot.outerHTML,
  };
}

async function generateNormalImages(template: string, size: number, name: string) {
  await Promise.all([
    sharp(Buffer.from(template))
      .resize({ width: size, height: size })
      .png()
      .toFile(path.join(outputFolder, `${name}.png`)),
    sharp(Buffer.from(template))
      .resize({ width: size*2, height: size*2 })
      .png()
      .toFile(path.join(outputFolder, `${name}@2x.png`)),
  ]);
}

async function generateUpdateAvailableImages(template: string, size: number, name: string, noticeSvg: string) {
  await Promise.all([
    sharp(Buffer.from(template))
      .composite([{
        input: (
          await sharp(Buffer.from(noticeSvg))
            .resize({
              width: Math.floor(size/1.5),
              height: Math.floor(size/1.5),
            })
            .toBuffer()
        ),
        top: Math.floor(size/2.5),
        left: Math.floor(size/2.5),
      }])
      .resize({ width: size, height: size })
      .png()
      .toFile(path.join(outputFolder, `${name}.png`)),
    sharp(Buffer.from(template))
      .composite([{
        input: (
          await sharp(Buffer.from(noticeSvg))
            .resize({
              width: Math.floor((size * 2)/1.5),
              height: Math.floor((size * 2)/1.5),
            })
            .toBuffer()
        ),
        top: Math.floor((size * 2)/2.5),
        left: Math.floor((size * 2)/2.5),
      }])
      .resize({ width: size*2, height: size*2 })
      .png()
      .toFile(path.join(outputFolder, `${name}@2x.png`)),
  ]);
}

async function getNoticeSvg(): Promise<string> {
  const svgData = await readFile(noticeFile, { encoding: "utf-8" });
  const noticeSvgRoot = new JSDOM(svgData).window.document.getElementsByTagName("svg")[0];

  noticeSvgRoot.innerHTML += getSvgStyling("dark");

  return noticeSvgRoot.outerHTML;
}

async function generateTrayIcons() {
  try {
    console.log("Generating tray icon pngs");
    await ensureOutputFoler();

    const baseTemplates = await getBaseIconTemplates();
    const noticeTemplate = await getNoticeSvg();

    await Promise.all([
      generateNormalImages(baseTemplates.light, size, "trayIconDarkTemplate"),
      generateUpdateAvailableImages(baseTemplates.light, size, "trayIconDarkUpdateAvailableTemplate", noticeTemplate),
      generateNormalImages(baseTemplates.dark, size, "trayIconTemplate"),
      generateUpdateAvailableImages(baseTemplates.dark, size, "trayIconUpdateAvailableTemplate", noticeTemplate),
    ]);

    console.log("Generated all images");
  } catch (error) {
    console.error(error);
  }
}

generateTrayIcons();
