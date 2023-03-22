/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { app as electronApp } from "electron";

export type PathName = Parameters<typeof electronApp["getPath"]>[0] | "currentApp";

export const pathNames: PathName[] = [
  "currentApp",
  "home",
  "appData",
  "userData",
  "sessionData",
  "temp",
  "exe",
  "module",
  "desktop",
  "documents",
  "downloads",
  "music",
  "pictures",
  "videos",
  "logs",
  "crashDumps",
  "recent",
];
