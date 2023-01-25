/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * Request default save-file dialog in browser.
 * @param filename Name of file to be saved locally
 * @param contents String or Buffer
 * @param type Content-type
 */
export function saveFileDialog(filename: string, contents: BlobPart | BlobPart[], type: string) {
  const data = new Blob([contents].flat(), { type });
  const url = URL.createObjectURL(data);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
