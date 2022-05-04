/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { nativeImage } from "electron";
import type { NativeImage  } from "electron";
import { base64 } from "../../common/utils";
import sharp from "sharp";
import { JSDOM } from "jsdom";
import LogoLens from "../../renderer/components/icon/logo-lens.svg";
import Notice from "../../renderer/components/icon/notice.svg";
import { getInjectable } from "@ogre-tools/injectable";
import isMacInjectable from "../../common/vars/is-mac.injectable";

export interface CreateTrayIconArgs {
  useDarkColors: boolean;
  updateAvailable: boolean;
}

export type CreateTrayIcon = (args: CreateTrayIconArgs) => Promise<NativeImage>;

const createTrayIconInjectable = getInjectable({
  id: "create-tray-icon",
  instantiate: (di): CreateTrayIcon => {
    const produceTemplateImage = di.inject(isMacInjectable);

    return async ({ useDarkColors, updateAvailable }) => {
      const size = 32; // 2x zoom
      const trayIconColor = useDarkColors ? "white" : "black"; // Invert to show contrast
      const trayBackgroundColor = useDarkColors ? "black" : "white";
      const styleTag =  produceTemplateImage
        ? ""
        : `
          <style>
            ellipse {
              stroke: ${trayIconColor} !important;
              fill: ${trayBackgroundColor} !important;
            }

            path, rect {
              fill: ${trayIconColor} !important;
            }
          </style>
        `;

      const overlayImages: sharp.OverlayOptions[] = [];
      const parsedLogoSvg = base64.decode(LogoLens.split("base64,")[1]);
      const logoSvgRoot = new JSDOM(parsedLogoSvg).window.document.getElementsByTagName("svg")[0];

      logoSvgRoot.innerHTML += styleTag;

      if (updateAvailable) {
        // This adds some contrast between the notice icon and the logo
        logoSvgRoot.innerHTML += `<ellipse ry="192" rx="192" cy="352" cx="352" />`;

        const parsedNoticeSvg = base64.decode(Notice.split("base64,")[1]);
        const noticeSvgRoot = new JSDOM(parsedNoticeSvg).window.document.getElementsByTagName("svg")[0];

        noticeSvgRoot.innerHTML += styleTag;

        const noticeImage = await sharp(Buffer.from(noticeSvgRoot.outerHTML))
          .resize({
            width: Math.floor(size/1.5),
            height: Math.floor(size/1.5),
          })
          .toBuffer();

        overlayImages.push({
          input: noticeImage,
          top: Math.floor(size/2.5),
          left: Math.floor(size/2.5),
        });
      }

      const iconBuffer = await sharp(Buffer.from(logoSvgRoot.outerHTML))
        .composite(overlayImages)
        .resize({ width: size, height: size })
        .png()
        .toBuffer();
      const image = nativeImage.createFromBuffer(iconBuffer, {
        scaleFactor: 2,
      });

      image.setTemplateImage(produceTemplateImage);

      return image;
    };
  },
});

export default createTrayIconInjectable;

