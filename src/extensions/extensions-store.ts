/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import type { LensExtensionId } from "./lens-extension";
import { BaseStore } from "../common/base-store";
import { action, computed, observable, makeObservable } from "mobx";
import { toJS } from "../common/utils";

export interface LensExtensionsStoreModel {
  extensions: Record<LensExtensionId, LensExtensionState>;
}

export interface LensExtensionState {
  enabled?: boolean;
  name: string;
}

export class ExtensionsStore extends BaseStore<LensExtensionsStoreModel> {
  constructor() {
    super({
      configName: "lens-extensions",
    });
    makeObservable(this);
    this.load();
  }

  @computed
  get enabledExtensions() {
    return Array.from(this.state.values())
      .filter(({enabled}) => enabled)
      .map(({name}) => name);
  }

  protected state = observable.map<LensExtensionId, LensExtensionState>();

  isEnabled({ id, isBundled }: { id: string, isBundled: boolean }): boolean {
    // By default false, so that copied extensions are disabled by default.
    // If user installs the extension from the UI, the Extensions component will specifically enable it.
    return isBundled || Boolean(this.state.get(id)?.enabled);
  }

  @action
  mergeState(extensionsState: Record<LensExtensionId, LensExtensionState>) {
    this.state.merge(extensionsState);
  }

  @action
  protected fromStore({ extensions }: LensExtensionsStoreModel) {
    this.state.merge(extensions);
  }

  toJSON(): LensExtensionsStoreModel {
    return toJS({
      extensions: Object.fromEntries(this.state),
    });
  }
}
