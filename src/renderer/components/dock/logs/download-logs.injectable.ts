/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import openSaveFileDialogInjectable from "../../../utils/save-file.injectable";

const downloadLogsInjectable = getInjectable({
  id: "download-logs",

  instantiate: (di) => {
    const openSaveFileDialog = di.inject(openSaveFileDialogInjectable);

    return (filename: string, logs: string[]) => {
      openSaveFileDialog(filename, logs.join("\n"), "text/plain");
    };
  },
});

export default downloadLogsInjectable;
