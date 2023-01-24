/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, comparer, observable, runInAction } from "mobx";
import type { BaseStore } from "../base-store/base-store";
import * as uuid from "uuid";
import type { CreateBaseStore } from "../base-store/create-base-store.injectable";
import type { Migrations } from "conf/dist/source/types";

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

interface Dependencies {
  readonly storeMigrationVersion: string;
  readonly migrations: Migrations<Record<string, unknown>>;
  createBaseStore: CreateBaseStore;
}

export class WeblinkStore {
  private readonly store: BaseStore<WeblinkStoreModel>;

  readonly weblinks = observable.array<WeblinkData>();

  constructor(private readonly dependencies: Dependencies) {
    this.store = this.dependencies.createBaseStore({
      configName: "lens-weblink-store",
      accessPropertiesByDotNotation: false, // To make dots safe in cluster context names
      syncOptions: {
        equals: comparer.structural,
      },
      projectVersion: this.dependencies.storeMigrationVersion,
      migrations: this.dependencies.migrations,
      fromStore: action(({ weblinks = [] }) => {
        this.weblinks.replace(weblinks);
      }),
      toJSON: () => ({
        weblinks: this.weblinks.toJSON(),
      }),
    });

    this.store.load();
  }

  add(data: WeblinkCreateOptions) {
    return runInAction(() => {
      const {
        id = uuid.v4(),
        name,
        url,
      } = data;
      const weblink: WeblinkData = { id, name, url };

      this.weblinks.push(weblink);

      return weblink;
    });
  }

  removeById(id: string) {
    runInAction(() => {
      this.weblinks.replace(this.weblinks.filter((w) => w.id !== id));
    });
  }
}
