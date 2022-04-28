/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { NativeImage, Tray } from "electron";
import { nativeImage, nativeTheme } from "electron";
import { JSDOM } from "jsdom";
import sharp from "sharp";
import { getOrInsertWithAsync, base64, type Disposer } from "../../common/utils";
import LogoLens from "../../renderer/components/icon/logo-lens.svg";

export interface CreateTrayIconArgs {
  shouldUseDarkColors: boolean;
  size: number;
  sourceSvg: string;
}

const trayIcons = new Map<boolean, NativeImage>();

async function createTrayIcon({ shouldUseDarkColors, size, sourceSvg }: CreateTrayIconArgs): Promise<NativeImage> {
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

export function createCurrentTrayIcon() {
  return createTrayIcon({
    shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
    size: 16,
    sourceSvg: LogoLens,
  });
}

export function watchShouldUseDarkColors(tray: Tray): Disposer {
  let prevShouldUseDarkColors = nativeTheme.shouldUseDarkColors;
  const onUpdated = () => {
    if (prevShouldUseDarkColors !== nativeTheme.shouldUseDarkColors) {
      prevShouldUseDarkColors = nativeTheme.shouldUseDarkColors;
      createCurrentTrayIcon()
        .then(img => tray.setImage(img));
    }
  };

  nativeTheme.on("updated", onUpdated);

  return () => nativeTheme.off("updated", onUpdated);
}
