/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type React from "react";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import rendererExtensionsInjectable from "../../../../extensions/renderer-extensions.injectable";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import type { CustomCategoryViewRegistration } from "../custom-views";
import customCategoryViewsInjectable from "../custom-views.injectable";

describe("Custom Category Views", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = getDiForUnitTesting();
  });

  it("should order items correctly over all extensions", () => {
    const component1 = (): React.ReactNode => null;
    const component2 = (): React.ReactNode => null;

    di.override(rendererExtensionsInjectable, () => computed(() => [
      {
        customCategoryViews: [
          {
            components: {
              View: component1,
            },
            group: "foo",
            kind: "bar",
            priority: 100,
          } as CustomCategoryViewRegistration,
        ],
      },
      {
        customCategoryViews: [
          {
            components: {
              View: component2,
            },
            group: "foo",
            kind: "bar",
            priority: 95,
          } as CustomCategoryViewRegistration,
        ],
      },
    ] as LensRendererExtension[]));

    const customCategoryViews = di.inject(customCategoryViewsInjectable);
    const { after = [] } = customCategoryViews.get().get("foo")?.get("bar") ?? {};

    expect(after[0].View).toBe(component2);
    expect(after[1].View).toBe(component1);
  });

  it("should put put priority < 50 items in before", () => {
    const component1 = (): React.ReactNode => null;
    const component2 = (): React.ReactNode => null;

    di.override(rendererExtensionsInjectable, () => computed(() => [
      {
        customCategoryViews: [
          {
            components: {
              View: component1,
            },
            group: "foo",
            kind: "bar",
            priority: 40,
          } as CustomCategoryViewRegistration,
        ],
      },
      {
        customCategoryViews: [
          {
            components: {
              View: component2,
            },
            group: "foo",
            kind: "bar",
            priority: 95,
          } as CustomCategoryViewRegistration,
        ],
      },
    ] as LensRendererExtension[]));

    const customCategoryViews = di.inject(customCategoryViewsInjectable);
    const { before = [] } = customCategoryViews.get().get("foo")?.get("bar") ?? {};

    expect(before[0].View).toBe(component1);
  });
});
