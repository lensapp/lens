/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { JsonObject } from "type-fest";

interface Dependencies {
  fs: {
    readJson: (filePath: string) => Promise<JsonObject>;
  };
}

export const readJsonFile =
  ({ fs }: Dependencies) =>
    (filePath: string) =>
      fs.readJson(filePath);
