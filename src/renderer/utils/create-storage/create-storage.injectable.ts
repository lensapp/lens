/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForLensLocalStorageInjectable from "../../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import { createStorage } from "./create-storage";
import readJsonFileInjectable from "../../../common/fs/read-json-file.injectable";
import writeJsonFileInjectable from "../../../common/fs/write-json-file.injectable";
import { observable } from "mobx";
import getAbsolutePathInjectable from "../../../common/path/get-absolute-path.injectable";
import createStorageLoggerInjectable from "./logger.injectable";

const createStorageInjectable = getInjectable({
  id: "create-storage",

  instantiate: (di) => createStorage({
    storage: observable({
      initialized: false,
      loaded: false,
      data: {} as Record<string /*key*/, any>, // json-serializable
    }),
    readJsonFile: di.inject(readJsonFileInjectable),
    writeJsonFile: di.inject(writeJsonFileInjectable),
    logger: di.inject(createStorageLoggerInjectable),
    directoryForLensLocalStorage: di.inject(directoryForLensLocalStorageInjectable),
    getAbsolutePath: di.inject(getAbsolutePathInjectable),
  }),
});

export default createStorageInjectable;
