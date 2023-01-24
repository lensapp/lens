/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { merge } from "lodash";
import { action, makeObservable, observable } from "mobx";
import type { PartialDeep } from "type-fest";
import type { BaseStoreDependencies } from "../base-store/base-store";
import { BaseStore } from "../base-store/base-store";

export interface EntityPreferencesModel {
  /**
   * Is used for displaying entity icons.
   */
  shortName?: string;
}

export interface EntityPreferencesStoreModel {
  entities?: [string, EntityPreferencesModel][];
}

export class EntityPreferencesStore extends BaseStore<EntityPreferencesStoreModel> {
  @observable readonly preferences = observable.map<string, PartialDeep<EntityPreferencesModel>>();

  constructor(deps: BaseStoreDependencies) {
    super(deps, {
      configName: "lens-entity-preferences-store",
    });

    makeObservable(this);
  }

  @action
  mergePreferences(entityId: string, preferences: PartialDeep<EntityPreferencesModel>): void {
    this.preferences.set(entityId, merge(this.preferences.get(entityId), preferences));
  }

  @action
  protected fromStore(data: EntityPreferencesStoreModel): void {
    this.preferences.replace(data.entities ?? []);
  }

  toJSON(): EntityPreferencesStoreModel {
    return {
      entities: this.preferences.toJSON(),
    };
  }
}
