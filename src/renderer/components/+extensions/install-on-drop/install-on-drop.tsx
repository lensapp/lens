/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import logger from "../../../../main/logger";

interface Dependencies {
  attemptInstalls: (filePaths: string[]) => Promise<void>;
}

export const installOnDrop =
  ({ attemptInstalls }: Dependencies) =>
    async (files: File[]) => {
      logger.info("Install from D&D");
      await attemptInstalls(files.map(({ path }) => path));
    };
