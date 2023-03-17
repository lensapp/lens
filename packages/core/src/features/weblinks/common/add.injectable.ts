/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import weblinksStateInjectable from "./state.injectable";
import type { WeblinkData } from "./storage.injectable";
import * as uuid from "uuid";
import { getOrInsert } from "@k8slens/utilities";

export interface WeblinkCreateOptions {
  id?: string;
  name: string;
  url: string;
}

export type AddWeblink = (data: WeblinkCreateOptions) => WeblinkData;

const addWeblinkInjectable = getInjectable({
  id: "add-weblink",
  instantiate: (di): AddWeblink => {
    const state = di.inject(weblinksStateInjectable);

    return action((data) => {
      const {
        id = uuid.v4(),
        name,
        url,
      } = data;

      if (state.has(id)) {
        throw new Error(`There already exists a weblink with id=${id}`);
      }

      return getOrInsert(state, id, { id, name, url });
    });
  },
});

export default addWeblinkInjectable;
