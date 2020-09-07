// Dynamic pages

import React from "react";
import { observable } from "mobx";
import type { IconProps } from "../icon";

export interface PageComponents {
  Main: React.ComponentType<any>;
  MenuIcon: React.ComponentType<IconProps>;
}

export class PagesStore {
  routes = observable.map<string, PageComponents>();

  getComponents(path: string): PageComponents | null {
    return this.routes.get(path);
  }

  register(path: string, components: PageComponents) {
    this.routes.set(path, components);
  }

  unregister(path: string) {
    this.routes.delete(path);
  }
}

export const dynamicPages = new PagesStore();
