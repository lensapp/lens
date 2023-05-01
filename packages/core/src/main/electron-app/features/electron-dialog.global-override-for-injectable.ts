/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "@k8slens/test-utils";
import electronDialogInjectable from "./electron-dialog.injectable";

export default getGlobalOverride(electronDialogInjectable, () => ({
  showCertificateTrustDialog: async () => {},
  showErrorBox: () => {},
  showMessageBox: () => Promise.resolve({
    checkboxChecked: false,
    response: 0,
  }),
  showMessageBoxSync: () => 0,
  showOpenDialog: () => Promise.resolve({
    canceled: true,
    filePaths: [],
  }),
  showOpenDialogSync: () => [],
  showSaveDialog: () => Promise.resolve({
    canceled: true,
  }),
  showSaveDialogSync: () => "",
}));
