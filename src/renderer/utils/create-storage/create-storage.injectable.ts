/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import directoryForLensLocalStorageInjectable from "../../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import { createStorage } from "./create-storage";
import readJsonFileInjectable from "../../../common/fs/read-json-file/read-json-file.injectable";
import writeJsonFileInjectable from "../../../common/fs/write-json-file/write-json-file.injectable";
import { bind } from "../../../common/utils";
import type { StorageLayer } from "../storageHelper";

const createStorageInjectable = getInjectable({
  instantiate: (di) => bind(createStorage, null, {
    readJsonFile: di.inject(readJsonFileInjectable),
    writeJsonFile: di.inject(writeJsonFileInjectable),
    directoryForLensLocalStorage: di.inject(directoryForLensLocalStorageInjectable),
  }) as <T>(key: string, defaultValue: T) => Promise<StorageLayer<T>>,

  lifecycle: lifecycleEnum.singleton,
});

export default createStorageInjectable;
