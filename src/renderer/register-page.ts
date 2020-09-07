// Extensions-api > Dynamic pages

import { observable } from "mobx";

export class PagesStore {
  @observable dynamicRoutes: string[] = [];

  registerRoute(path: string | string[]) {
    return;
  }
}

export const pagesStore = new PagesStore();