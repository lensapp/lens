/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import attemptInstallInjectable from "./attempt-install/attempt-install.injectable";
import { readFileNotify } from "./read-file-notify/read-file-notify";
import path from "path";
import type { InstallRequest } from "./attempt-install/install-request";
import type { Disposer } from "../../utils";
import startPreInstallInjectable from "../../extensions/installation-state/start-pre-install.injectable";

interface Dependencies {
  attemptInstall: (request: InstallRequest, disposer: Disposer) => Promise<void>;
  startPreInstall: () => Disposer;
}

export const attemptInstalls = ({ attemptInstall, startPreInstall }: Dependencies) => (
  async (filePaths: string[]): Promise<void> => {
    const promises: Promise<void>[] = [];
    const disposer = startPreInstall();

    for (const filePath of filePaths) {
      promises.push(
        attemptInstall({
          fileName: path.basename(filePath),
          dataP: readFileNotify(filePath),
        }, disposer),
      );
    }

    await Promise.allSettled(promises);
  }
);

const attemptInstallsInjectable = getInjectable({
  instantiate: (di) => attemptInstalls({
    attemptInstall: di.inject(attemptInstallInjectable),
    startPreInstall: di.inject(startPreInstallInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default attemptInstallsInjectable;
