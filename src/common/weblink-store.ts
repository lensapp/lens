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

import { action, comparer, observable, makeObservable } from "mobx";
import { BaseStore } from "./base-store";
import migrations from "../migrations/weblinks-store";
import * as uuid from "uuid";
import { toJS } from "./utils";

export interface WeblinkData {
  id: string;
  name: string;
  url: string;
}

export interface WeblinkCreateOptions {
  id?: string;
  name: string;
  url: string;
}


export interface WeblinkStoreModel {
  weblinks: WeblinkData[];
}

export class WeblinkStore extends BaseStore<WeblinkStoreModel> {
  @observable weblinks: WeblinkData[] = [];

  constructor() {
    super({
      configName: "lens-weblink-store",
      accessPropertiesByDotNotation: false, // To make dots safe in cluster context names
      syncOptions: {
        equals: comparer.structural,
      },
      migrations,
    });
    makeObservable(this);
    this.load();
  }

  @action
  protected fromStore(data: Partial<WeblinkStoreModel> = {}) {
    this.weblinks = data.weblinks || [];
  }

  add(data: WeblinkCreateOptions) {
    const {
      id = uuid.v4(),
      name,
      url,
    } = data;

    const weblink = { id, name, url };

    this.weblinks.push(weblink as WeblinkData);

    return weblink as WeblinkData;
  }

  @action
  removeById(id: string) {
    this.weblinks = this.weblinks.filter((w) => w.id !== id);
  }

  toJSON(): WeblinkStoreModel {
    const model: WeblinkStoreModel = {
      weblinks: this.weblinks,
    };

    return toJS(model);
  }
}
