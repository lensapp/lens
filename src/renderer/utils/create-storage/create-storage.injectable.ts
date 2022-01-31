/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import directoryForLensLocalStorageInjectable from "../../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import { createStorage } from "./create-storage";
import readJsonFileInjectable from "../../../common/fs/read-json-file.injectable";
import writeJsonFileInjectable from "../../../common/fs/write-json-file.injectable";

const createStorageInjectable = getInjectable({
  instantiate: (di) =>
    createStorage({
      readJsonFile: di.inject(readJsonFileInjectable),
      writeJsonFile: di.inject(writeJsonFileInjectable),

      directoryForLensLocalStorage: di.inject(
        directoryForLensLocalStorageInjectable,
      ),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default createStorageInjectable;
