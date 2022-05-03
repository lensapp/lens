/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { nativeImage } from "electron";
import type { NativeImage  } from "electron";
import { base64, getOrInsertWithAsync } from "../../common/utils";
import sharp from "sharp";
import { JSDOM } from "jsdom";

export interface CreateTrayIconArgs {
  shouldUseDarkColors: boolean;
  size: number;
  sourceSvg: string;
}

const trayIcons = new Map<boolean, NativeImage>();

export async function createTrayIcon({ shouldUseDarkColors, size, sourceSvg }: CreateTrayIconArgs): Promise<NativeImage> {
  return getOrInsertWithAsync(trayIcons, shouldUseDarkColors, async () => {
    const trayIconColor = shouldUseDarkColors ? "white" : "black"; // Invert to show contrast
    const parsedSvg = base64.decode(sourceSvg.split("base64,")[1]);
    const svgDom = new JSDOM(`<body>${parsedSvg}</body>`);
    const svgRoot = svgDom.window.document.body.getElementsByTagName("svg")[0];

    svgRoot.innerHTML += `<style>* {fill: ${trayIconColor} !important;}</style>`;

    const iconBuffer = await sharp(Buffer.from(svgRoot.outerHTML))
      .resize({ width: size, height: size })
      .png()
      .toBuffer();

    return nativeImage.createFromBuffer(iconBuffer);
  });
}
