/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import randomColor from "randomcolor";

export interface ComputedRandomColorOptions {
    hue?: number | string | undefined;
    luminosity?: "bright" | "light" | "dark" | "random" | undefined;
    seed?: number | string | undefined;
    format?: "hsvArray" | "hslArray" | "hsl" | "hsla" | "rgbArray" | "rgb" | "rgba" | "hex" | undefined;
    alpha?: number | undefined;
}

export type ComputeRandomColor = (options?: ComputedRandomColorOptions) => string;

const computeRandomColorInjectable = getInjectable({
  id: "compute-random-color",
  instantiate: (): ComputeRandomColor => randomColor,
  causesSideEffects: true,
});

export default computeRandomColorInjectable;
