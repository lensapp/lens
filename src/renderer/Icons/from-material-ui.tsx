import React from "react";
import { remote } from "electron";
import * as Icons from "@material-ui/icons";
import { render, cleanup } from "@testing-library/react";

type IconName = keyof typeof Icons;

export class NativeImageCache {
  private static cache = new Map<IconName, Electron.NativeImage>();

  static fromName(name: IconName): Electron.NativeImage {
    const prev = NativeImageCache.cache.get(name);

    if (prev) {
      return prev;
    }

    const Icon = Icons[name];

    if (!Icon) {
      throw new Error(`Invalid icon name: ${name}`);
    }

    cleanup();
    const svgPath = render(<Icon />).baseElement.querySelector("svg").querySelector("path").getAttribute("d");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 24;
    canvas.height = 24;
    ctx.fillStyle = remote.nativeTheme.shouldUseDarkColors ? "white" : "black"; // swap for contrast
    ctx.fill(new Path2D(svgPath));

    const png = canvas.toDataURL("image/png");
    const icon = remote.nativeImage.createFromDataURL(png).resize({ width: 16, height: 16 });

    NativeImageCache.cache.set(name, icon);

    return icon;
  }
}
