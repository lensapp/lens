/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { orderBy } from "lodash";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";
import { getOrInsert, getOrInsertMap } from "@k8slens/utilities";
import type { CustomCategoryViewComponents } from "./custom-views";

interface Dependencies {
  extensions: IComputedValue<LensRendererExtension[]>;
}

export interface RegisteredCustomCategoryViewDecl {
  /**
   * The asc sorted list of items with priority set to < 50
   */
  before: CustomCategoryViewComponents[];
  /**
   * The asc sorted list of items with priority not set or set to >= 50
   */
  after: CustomCategoryViewComponents[];
}

function getCustomCategoryViews({ extensions }: Dependencies): IComputedValue<Map<string, Map<string, RegisteredCustomCategoryViewDecl>>> {
  return computed(() => {
    const res = new Map<string, Map<string, RegisteredCustomCategoryViewDecl>>();
    const registrations = extensions.get()
      .flatMap(ext => ext.customCategoryViews)
      .map(({ priority = 50, ...rest }) => ({ priority, ...rest }));
    const sortedRegistrations = orderBy(registrations, "priority", "asc");

    for (const { priority, group, kind, components } of sortedRegistrations) {
      const byGroup = getOrInsertMap(res, group);
      const { before, after } = getOrInsert(byGroup, kind, { before: [], after: [] });

      if (priority < 50) {
        before.push(components);
      } else {
        after.push(components);
      }
    }

    return res;
  });
}

const customCategoryViewsInjectable = getInjectable({
  id: "custom-category-views",

  instantiate: (di) => getCustomCategoryViews({
    extensions: di.inject(rendererExtensionsInjectable),
  }),
});

export default customCategoryViewsInjectable;
