/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import attemptInstallsInjectable from "./attempt-installs.injectable";
import logger from "../../../main/logger";

interface Dependencies {
  attemptInstalls: (filePaths: string[]) => Promise<void>;
}

const installOnDrop = ({ attemptInstalls }: Dependencies) => (
  async (files: File[]) => {
    logger.info("Install from D&D");
    await attemptInstalls(files.map(({ path }) => path));
  }
);

const installOnDropInjectable = getInjectable({
  instantiate: (di) => installOnDrop({
    attemptInstalls: di.inject(attemptInstallsInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default installOnDropInjectable;
