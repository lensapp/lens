/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getBasenameOfPathInjectable from "../../../../common/path/get-basename.injectable";
import attemptInstallInjectable from "../attempt-install/attempt-install.injectable";
import readFileNotifyInjectable from "../read-file-notify/read-file-notify.injectable";

export type AttemptInstalls = (filePaths: string[]) => Promise<void>;

const attemptInstallsInjectable = getInjectable({
  id: "attempt-installs",

  instantiate: (di): AttemptInstalls => {
    const attemptInstall = di.inject(attemptInstallInjectable);
    const getBasenameOfPath = di.inject(getBasenameOfPathInjectable);
    const readFileNotify = di.inject(readFileNotifyInjectable);

    return async (filePaths) => {
      await Promise.allSettled(filePaths.map(filePath => (
        attemptInstall({
          fileName: getBasenameOfPath(filePath),
          dataP: readFileNotify(filePath),
        })
      )));
    };
  },
});

export default attemptInstallsInjectable;
