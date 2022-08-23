/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { BaseStore } from "../common/base-store";
import * as path from "path";
import type { LensExtension } from "./lens-extension";
import assert from "assert";

export abstract class ExtensionStore<T> extends BaseStore<T> {
  readonly displayName = "ExtensionStore<T>";
  protected extension?: LensExtension;

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
