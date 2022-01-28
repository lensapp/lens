/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { installFromSelectFileDialog } from "./install-from-select-file-dialog";
import attemptInstallsInjectable from "../attempt-installs/attempt-installs.injectable";
import directoryForDownloadsInjectable from "../../../../common/app-paths/directory-for-downloads.injectable";

const installFromSelectFileDialogInjectable = getInjectable({
  instantiate: (di) =>
    installFromSelectFileDialog({
      attemptInstalls: di.inject(attemptInstallsInjectable),
      directoryForDownloads: di.inject(directoryForDownloadsInjectable),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default installFromSelectFileDialogInjectable;
