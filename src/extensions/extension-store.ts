/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { BaseStoreParams } from "../common/base-store";
import { BaseStore } from "../common/base-store";
import * as path from "path";
import type { LensExtension } from "./lens-extension";
import assert from "assert";
import { getLegacyGlobalDiForExtensionApi } from "./as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import loggerInjectable from "../common/logger.injectable";
import getConfigurationFileModelInjectable from "../common/get-configuration-file-model/get-configuration-file-model.injectable";
import directoryForUserDataInjectable from "../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import appVersionInjectable from "../common/get-configuration-file-model/app-version/app-version.injectable";

export abstract class ExtensionStore<T> extends BaseStore<T> {
  readonly displayName = "ExtensionStore<T>";
  protected extension?: LensExtension;

  constructor(params: BaseStoreParams<T>) {
    const di = getLegacyGlobalDiForExtensionApi();

    super({
      logger: di.inject(loggerInjectable),
      getConfigurationFileModel: di.inject(getConfigurationFileModelInjectable),
      appVersion: di.inject(appVersionInjectable),
      directoryForUserData: di.inject(directoryForUserDataInjectable),
    }, params);
  }

  loadExtension(extension: LensExtension) {
    this.extension = extension;

    return super.load();
  }

  load() {
    if (!this.extension) { return; }

    return super.load();
  }

  protected cwd() {
    assert(this.extension, "must call this.load() first");

    return path.join(super.cwd(), "extension-store", this.extension.name);
  }
}
