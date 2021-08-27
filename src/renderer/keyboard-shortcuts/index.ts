/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { ipcRenderer } from "electron";
import { navigate } from "../navigation";

/**
 * The definition of a keyboard shortcut
 */
interface Shortcut {
  code?: string;
  key?: string;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  action: () => void;
}

const shortcuts: Shortcut[] = [
  {
    key: "p",
    metaKey: true,
    shiftKey: true,
    action: () => ipcRenderer.emit("command-palette:open"),
  },
  {
    code: "Comma",
    metaKey: true,
    action: () => navigate("/preferences"),
  },
];

function shortcutMatches(shortcut: Shortcut, event: KeyboardEvent): boolean {
  if (typeof shortcut.metaKey === "boolean" && shortcut.metaKey !== event.metaKey) {
    return false;
  }

  if (typeof shortcut.altKey === "boolean" && shortcut.altKey !== event.altKey) {
    return false;
  }

  if (typeof shortcut.shiftKey === "boolean" && shortcut.shiftKey !== event.shiftKey) {
    return false;
  }

  if (typeof shortcut.ctrlKey === "boolean" && shortcut.ctrlKey !== event.ctrlKey) {
    return false;
  }

  if (typeof shortcut.code === "string" && shortcut.code !== event.code) {
    return false;
  }

  if (typeof shortcut.key === "string" && shortcut.key !== event.key) {
    return false;
  }

  return true;
}

export function registerKeyboardShortcuts() {
  window.addEventListener("keydown", event => {
    for (const shortcut of shortcuts) {
      if (shortcutMatches(shortcut, event)) {
        shortcut.action();
      }
    }
  });
}
