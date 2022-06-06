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
  const dom = new JSDOM(`<body>${svgData}</body>`);
  const root = dom.window.document.body.getElementsByTagName("svg")[0];

  root.innerHTML += getSvgStyling("light");

  return root.outerHTML;
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
  const circleSvg = new JSDOM(`
    <body>
      <svg viewBox="0 0 32 32">
        <circle cx="20" cy="20" r="6" />
      </svg>
      <style>
        circle {
          fill: "black" !important;
        }
      </style>
    </body>
  `).window.document.getElementsByTagName("svg")[0];

  circleSvg.innerHTML += getSvgStyling("dark");

  const circleBuffer = await sharp(Buffer.from(circleSvg.outerHTML))
    .resize({
      width: Math.floor(size/1.5),
      height: Math.floor(size/1.5),
    })
    .toBuffer();

  await sharp(circleBuffer)
    .toFile(path.join(outputFolder, "circle.png"));

  await Promise.all([
    sharp(Buffer.from(template))
      .resize({ width: size, height: size })
      .composite([
        {
          input: circleBuffer,
          gravity: "southeast",
          /**
           * The `clear` blend rule is buggy and currently doesn't work
           *
           * https://github.com/lovell/sharp/issues/3247
           */
          blend: "clear",
        },
        {
          input: (
            await sharp(Buffer.from(noticeSvg))
              .resize({
                width: Math.floor(size/1.5),
                height: Math.floor(size/1.5),
              })
              .toBuffer()
          ),
          gravity: "southeast",
        },
      ])
      .png()
      .toFile(path.join(outputFolder, `${name}.png`)),
    sharp(Buffer.from(template))
      .composite([
        {
          input: circleBuffer,
          gravity: "southeast",
          blend: "clear",
        },
        {
          input: (
            await sharp(Buffer.from(noticeSvg))
              .resize({
                width: Math.floor((size * 2)/1.5),
                height: Math.floor((size * 2)/1.5),
              })
              .toBuffer()
          ),
          gravity: "southeast",
        },
      ])
      .resize({ width: size*2, height: size*2 })
      .png()
      .toFile(path.join(outputFolder, `${name}@2x.png`)),
  ]);
}

async function getNoticeSvg(): Promise<string> {
  const svgData = await readFile(noticeFile, { encoding: "utf-8" });
  const noticeSvgRoot = new JSDOM(svgData).window.document.getElementsByTagName("svg")[0];

  return noticeSvgRoot.outerHTML;
}

async function generateTrayIcons() {
  try {
    console.log("Generating tray icon pngs");
    await ensureOutputFoler();

    const baseTemplate = await getBaseIconTemplates();
    const noticeTemplate = await getNoticeSvg();

    void noticeTemplate;
    void generateUpdateAvailableImages;

    await Promise.all([
      generateNormalImages(baseTemplate, size, "trayIconTemplate"),
      // generateUpdateAvailableImages(baseTemplate, size, "trayIconDarkUpdateAvailableTemplate", noticeTemplate),
    ]);

    console.warn("Did not update:", [
      "trayIconUpdateAvailableTemplate.png",
      "trayIconUpdateAvailableTemplate@2x.png",
    ]);
    console.log("Generated all images");
  } catch (error) {
    console.error(error);
  }
}

generateTrayIcons();
