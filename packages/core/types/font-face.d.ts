/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export {};

declare global {
  const FontFace: FontFace;

  interface Document {
    fonts: FontFaceSet;
  }

  type CSSOMString = string;
  type FontFaceLoadStatus = "unloaded" | "loading" | "loaded" | "error";
  type FontFaceSetStatus = "loading" | "loaded";

  class FontFace implements FontFaceDescriptors {
    constructor(family: string, source: string | ArrayBuffer, descriptors?: FontFaceDescriptors);
    readonly status: FontFaceLoadStatus;
    readonly loaded: Promise<FontFace>;
    variationSettings: CSSOMString;
    display: CSSOMString;
    load(): Promise<FontFace>;
  }

  interface FontFaceDescriptors {
    family: CSSOMString;
    style: CSSOMString;
    weight: CSSOMString;
    stretch: CSSOMString;
    unicodeRange: CSSOMString;
    variant: CSSOMString;
    featureSettings: CSSOMString;
  }

  interface FontFaceSet extends Iterable<FontFace> {
    readonly status: FontFaceSetStatus;
    readonly ready: Promise<FontFaceSet>;
    add(font: FontFace): void;
    check(font: string, text?: string): Boolean; // might not work, throws exception
    load(font: string, text?: string): Promise<FontFace[]>;
    delete(font: FontFace): void;
    clear(): void;
  }
}
